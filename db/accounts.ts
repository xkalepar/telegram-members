"use server";

// import uri from "@/lib/uri";
import prisma from "@/prisma/db";
import { Session } from "inspector/promises";
import { revalidateTag, unstable_cache } from "next/cache";
import { env } from "process";
import { TelegramClient, Api } from "telegram";
import { computeCheck } from "telegram/Password";
import { StringSession } from "telegram/sessions";
const apiId = Number(env.API_ID);
const apiHash = String(env.API_HASH);
const stringSession = new StringSession("");

export const sendCode = async ({
  phoneNumber,
}: {
  phoneNumber: string;
}): Promise<{ message: string; phoneCodeHash: string | null }> => {
  if (!phoneNumber) {
    return { message: "NO_PHONE_NUMBER_WAS_PROVIDED", phoneCodeHash: null };
  }
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.connect();

  try {
    const result = await client.invoke(
      new Api.auth.SendCode({
        phoneNumber,
        apiId,
        apiHash,
        settings: new Api.CodeSettings({
          allowFlashcall: true,
          currentNumber: true,
          allowAppHash: true,
          allowMissedCall: true,
          logoutTokens: [Buffer.from("arbitrary data here")],
        }),
      })
    );

    if (result.className === "auth.SentCode") {
      return {
        message: "code_has_been_sent_to_your_telegram_account",
        phoneCodeHash: result.phoneCodeHash,
      };
    }

    return {
      message: "Error occurred while sending code",
      phoneCodeHash: null,
    };
  } catch (error: any) {
    console.error(error);
    return {
      message: error.message || "An error occurred while sending code",
      phoneCodeHash: null,
    };
  }
};
export const getAccounts = unstable_cache(
  async ({
    phoneNumber,
    userId,
  }: {
    phoneNumber?: string;
    userId?: string;
  }) => {
    // console.log("calling get acc");
    // console.log(
    //   `${uri}/accounts?${phoneNumber ? `phoneNumber=${phoneNumber}` : ""}&${
    //     userId ? `userId=${userId}` : ""
    //   }`
    // );
    try {
      // const res = await fetch(
      //   `${uri}/accounts?${phoneNumber && `phoneNumber=${phoneNumber}`}&${
      //     userId && `userId=${userId}`
      //   }`,
      //   {
      //     method: "GET",
      //     headers: {
      //       "Content-Type": "application/json", // Add the Content-Type header
      //     },
      //   }
      // );
      // const data: { data: TelegramAccount[] } = await res.json();
      // if (data.data) {
      //   return data.data;
      // }
      const accounts = await prisma.telegramAccount.findMany({
        where: {
          phoneNumber: {
            contains: phoneNumber,
          },
        },
      });
      if (accounts) {
        return accounts;
      }
      return [];
    } catch (error) {
      console.log(error);
      return [];
    }
  },
  ["accounts"],
  { tags: ["accounts"] }
);

export const verifyCodeAndPassword = async ({
  phoneNumber,
  phoneCode,
  phoneCodeHash,
  password,
}: {
  phoneNumber: string;
  phoneCode: string;
  phoneCodeHash: string;
  password?: string;
}): Promise<{ message: string }> => {
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.connect();

  try {
    // Attempt sign-in with phone number and code
    const result = await client.invoke(
      new Api.auth.SignIn({
        phoneNumber,
        phoneCode,
        phoneCodeHash,
      })
    );

    // Serialize the session after connecting to the Telegram client
    const serializedSession = stringSession.save();

    // Save the session to your database

    await prisma.telegramAccount.create({
      data: {
        accId: 11,
        phoneNumber,
        session: serializedSession,
        ownerId: "me",
        password,
      },
    });
    revalidateTag("accounts");
    return { message: "logged" };
  } catch (error: any) {
    console.log(error);
    if (error.errorMessage === "SESSION_PASSWORD_NEEDED") {
      if (!password) {
        return { message: "SESSION_PASSWORD_NEEDED" };
      }

      try {
        // Get password info
        const passwordInfo = await client.invoke(new Api.account.GetPassword());
        const srpPassword = await computeCheck(passwordInfo, password);

        // Invoke the CheckPassword method
        await client.invoke(
          new Api.auth.CheckPassword({
            password: srpPassword,
          })
        );

        // Serialize the session after successful password verification
        const serializedSession = stringSession.save();

        // Update the session in the database
        await prisma.telegramAccount.create({
          data: {
            accId: 11,
            phoneNumber,
            session: serializedSession,
            ownerId: "me",
            password,
          },
        });
        revalidateTag("accounts");
        return { message: "logged" };
      } catch (passwordError: any) {
        return {
          message: passwordError.message || "Password verification failed",
        };
      }
    }

    return { message: error.errorMessage || "Unknown Error" };
  }
};

export const deleteAccount = async (id: string) => {
  try {
    const deletedAccount = await prisma.telegramAccount.delete({
      where: {
        id,
      },
    });

    if (!deletedAccount) {
      return { message: "حدث خطأ أثناء الحذف" };
    }
    const client = new TelegramClient(
      new StringSession(deletedAccount.session),
      apiId,
      apiHash,
      {
        connectionRetries: 5,
      }
    );
    await client.connect(); // This assumes you have already authenticated with .start()
    await client.invoke(new Api.auth.LogOut());
    revalidateTag("accounts");

    return { message: "تم الحذف بنجاح" };
  } catch (error) {
    console.log(error);
    return { message: "حدث خطأ غير معروف" };
  }
};
