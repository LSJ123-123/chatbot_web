import { createClient } from '@/utils/supabase/server';
import ClientCategorySection from '../client-category';

// Fisher-Yates 셔플 알고리즘
const shuffleArray = (array : any) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const CategoryChatbotSection = async () => {
    const supabase = createClient();
    
    const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .order('id');

    const { data: chatbots, error: chatbotsError } = await supabase
        .from('chatbots')
        .select(`
            id, name, chatbot_desc, img,
            chatbot_categories(category_id)
        `)
        .order('id');

    if (categoriesError || chatbotsError) {
        console.error('Error fetching data:', categoriesError || chatbotsError);
        return <div>Error loading data</div>;
    }

    // 각 카테고리별로 챗봇을 그룹화하고 섞습니다
    const shuffledChatbotsByCategory = categories.reduce((acc : any, category : any) => {
        const categoryBots = chatbots.filter(chatbot => 
            chatbot.chatbot_categories.some(cc => cc.category_id === category.id)
        );
        acc[category.id] = shuffleArray([...categoryBots]);
        return acc;
    }, {});

    // 전체 챗봇 목록도 섞습니다
    const shuffledAllChatbots = shuffleArray([...chatbots]);

    return (
        <ClientCategorySection 
            initialCategories={categories} 
            initialChatbots={shuffledAllChatbots}
            shuffledChatbotsByCategory={shuffledChatbotsByCategory}
        />
    );
};

export default CategoryChatbotSection;