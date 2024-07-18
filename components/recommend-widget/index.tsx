"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import CategoryRecommendation from '@/components/category-recommend';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import SkeletonRecommendation from '@/components/skeleton/recommend';

const supabase = createClient();

const RecommendationWidget = () => {
  const [categories, setCategories] = useState<any>([]);
  const [allChatbots, setAllChatbots] = useState<any>([]);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentChatbots, setCurrentChatbots] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const shuffleArray = useCallback((array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  const getRandomChatbotsForCategory = useCallback((categoryId: number) => {
    const categoryBots = allChatbots.filter((chatbot: any) =>
      chatbot.chatbot_categories.some((cc: any) => cc.category_id === categoryId)
    );
    return shuffleArray(categoryBots).slice(0, 2);
  }, [allChatbots, shuffleArray]);

  useEffect(() => {
    fetchCategoriesAndChatbots();
  }, []);

  useEffect(() => {
    if (categories.length > 0 && allChatbots.length > 0) {
      setCurrentChatbots(getRandomChatbotsForCategory(categories[currentCategoryIndex].id));
    }
  }, [currentCategoryIndex, categories, allChatbots, getRandomChatbotsForCategory]);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          rotateCategory();
          return 0;
        }
        return Math.min(oldProgress + 1, 100);
      });
    }, 100);

    return () => clearInterval(timer);
  }, [currentCategoryIndex, categories]);

  const fetchCategoriesAndChatbots = async () => {
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')
      .order('id');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      return;
    }

    const { data: chatbotsData, error: chatbotsError } = await supabase
      .from('chatbots')
      .select(`
        id, name, chatbot_desc, img,
        chatbot_categories(category_id)
      `);

    if (chatbotsError) {
      console.error('Error fetching chatbots:', chatbotsError);
      return;
    }

    setCategories(shuffleArray(categoriesData));
    setAllChatbots(chatbotsData);
    setIsLoading(false);
  };

  const rotateCategory = () => {
    setCurrentCategoryIndex((prevIndex: number) =>
      (prevIndex + 1) % categories.length
    );
    setProgress(0);
  };

  if (isLoading) {
    return <SkeletonRecommendation />;
  }

  return (
    <div className="bg-gray-100 p-4 sm:p-6 md:p-8 lg:p-10 rounded-lg shadow-lg mt-5 mx-auto mb-6 max-w-7xl w-full">
      <Label className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 block">이런건 어떨까요...</Label>
      <div className="min-h-[200px] sm:min-h-[280px] md:min-h-[320px] lg:min-h-[360px]">
        {categories.length > 0 && (
          <CategoryRecommendation 
            category={categories[currentCategoryIndex]} 
            chatbots={currentChatbots}
          />
        )}
      </div>
      <Button onClick={rotateCategory} className="mt-4 sm:mt-6 w-full sm:w-auto">다음 추천</Button>
      <Progress value={progress} className="mt-6 sm:mt-8 h-1" />
    </div>
  );
};

export default RecommendationWidget;