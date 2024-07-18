import RecommendationWidget from "@/components/recommend-widget";
import Section from "@/components/section";

export default function Home() {
  return (
    <>
      <RecommendationWidget />
      <Section text="인기 챗봇 목록" />
      <Section text="" />
    </>
  )
}
