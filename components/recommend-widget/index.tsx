"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import CategoryRecommendation from '@/components/category-recommend';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import SkeletonRecommendation from '@/components/skeleton/recommend';

const supabase = createClient();

const RecommendationWidget = () => {
  const [categories, setCategories] = useState([]);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('id');

    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(shuffleArray(data));
      setIsLoading(false);
    }
  };

  const shuffleArray = (array: any) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const rotateCategory = () => {
    setCurrentCategoryIndex((prevIndex) =>
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
      <div className="min-h-[200px] sm:min-h-[280px] md:min-h-[320px] lg:min-h-[360px]"> {/* 최소 높이 설정 */}
        {categories.length > 0 && (
          <CategoryRecommendation category={categories[currentCategoryIndex]} />
        )}
      </div>
      <Button onClick={rotateCategory} className="mt-4 sm:mt-6 w-full sm:w-auto">다음 추천</Button>
      <Progress value={progress} className="mt-6 sm:mt-8 h-1" /> {/* 높이 조정 */}
    </div>
  );
};

export default RecommendationWidget;