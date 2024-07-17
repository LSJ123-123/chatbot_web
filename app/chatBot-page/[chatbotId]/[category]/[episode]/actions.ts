'use server'

import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateOpenAIResponse(messages: any[], chatbotId: string) {
    const supabase = createClient();

    try {
        const { data: modelData, error: modelError } = await supabase
            .from('chatbot_models')
            .select('model')
            .eq('chatbot_id', chatbotId)
            .single();

        if (modelError) throw new Error('챗봇 모델을 가져오는 데 실패했습니다.');

        const model = modelData.model;

        const response = await openai.chat.completions.create({
            model: model,
            messages: messages,
            temperature: 0.01,
            max_tokens: 1000,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error generating response:', error);
        return "죄송합니다. 응답을 생성하는 동안 오류가 발생했습니다.";
    }
}