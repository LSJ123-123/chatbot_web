import RecommendationWidget from "@/components/recommend-widget";
import Section from "@/components/section";

export default function Home() {
  return (
    <>
      <RecommendationWidget />
      <Section text="챗봇 인기 순위" />
      <Section text="챗봇 카테고리" />
    </>
  )
}
