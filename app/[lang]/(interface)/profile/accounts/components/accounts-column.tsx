"use client";
import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { TelegramAccount } from "@prisma/client";
import { DeleteAccountForm } from "./forms";

export const arAccountsTable: ColumnDef<TelegramAccount>[] = [
  {
    accessorKey: "اسم المستخدم",
    header: "اسم المستخدم",
    cell: ({ row }) => {
      if (row) {
        const username = row.original?.username;
        return <div>{username ?? "لايوجد"}</div>;
      } else {
        <div>لايوجد</div>;
      }
    },
  },
  {
    accessorKey: "رقم الهاتف",
    header: "رقم الهاتف",
    cell: ({ row }) => {
      if (row) {
        const phone = row.original?.phoneNumber;
        return <div>{phone}</div>;
      } else {
        <div>لايوجد</div>;
      }
    },
  },
  {
    accessorKey: "ايدي",
    header: "ايدي",
    cell: ({ row }) => {
      if (row) {
        const id = row.original?.accId;
        return <div>{id}</div>;
      } else {
        <div>لايوجد</div>;
      }
    },
  },

  {
    id: "actions",
    header: "الأحداث",
    enableHiding: false,
    cell: ({ row }) => {
      const account = row.original;
      return (
        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">افتح الأحداث</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>الأحداث</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(String(account.phoneNumber));
                toast({
                  className: "bg-primary text-white",
                  description: "تم نسخ رقم الهاتف بنجاح",
                });
              }}
            >
              نسح رقم الهاتف
            </DropdownMenuItem>

            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <DeleteAccountForm account={account} />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
export const enAccountsTable: ColumnDef<TelegramAccount>[] = [
  {
    accessorKey: "username",
    header: "username",
    cell: ({ row }) => {
      if (row) {
        const username = row.original?.username;
        return <div>{username ?? "لايوجد"}</div>;
      } else {
        <div>لايوجد</div>;
      }
    },
  },
  {
    accessorKey: "phone",
    header: "phone",
    cell: ({ row }) => {
      if (row) {
        const phone = row.original?.phoneNumber;
        return <div>{phone}</div>;
      } else {
        <div>لايوجد</div>;
      }
    },
  },
  {
    accessorKey: "id",
    header: "id",
    cell: ({ row }) => {
      if (row) {
        const id = row.original?.accId;
        return <div>{id}</div>;
      } else {
        <div>لايوجد</div>;
      }
    },
  },
  {
    id: "actions",
    header: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const account = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">opne actions</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>الأحداث</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(String(account.phoneNumber));
                toast({
                  className: "bg-primary text-white",
                  description: "phone number copied",
                });
              }}
            >
              copy phone
            </DropdownMenuItem>

            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <DeleteAccountForm account={account} />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
