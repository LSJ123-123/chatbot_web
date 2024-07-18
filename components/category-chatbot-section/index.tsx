import { createClient } from '@/utils/supabase/server';
import ClientCategorySection from '../client-category';

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

    return <ClientCategorySection initialCategories={categories} initialChatbots={chatbots} />;
};

export default CategoryChatbotSection;