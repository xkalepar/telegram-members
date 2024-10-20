import Carousel from "@/components/carousel";
import MainSection from "../sections/main";
import Header from "../components/header/header";
import Footer from "../components/footer";
import ThirdSection from "../sections/get-started";
import SecondSection from "../sections/brands";
import Pricing from "../sections/pricing";
import SalesSection from "../sections/sales";
import { Locale } from "@/i18n-config";

const Home = async ({ params: { lang } }: { params: { lang: Locale } }) => {
  return (
    <>
      <Header />
      <main>
        <MainSection
          params={{
            lang: lang,
          }}
        />
        <Carousel />
        <SecondSection
          params={{
            lang: lang,
          }}
        />
        <ThirdSection
          params={{
            lang: lang,
          }}
        />
        <SalesSection
          params={{
            lang: lang,
          }}
        />
        <Pricing
          params={{
            lang: lang,
          }}
        />
      </main>
      <Footer />
    </>
  );
};

export default Home;
