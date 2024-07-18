'use server'

import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function validateResponse(userMessage: string, botResponse: string): Promise<boolean> {
    console.log('Validating response for natural flow and appropriateness...');

    const validationResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            { role: 'system', content: '당신은 대화 흐름이 자연스럽고 적절한지 검증하는 AI입니다. 응답이 완벽하지 않더라도 대화의 맥락에서 크게 벗어나지 않으면 허용해주세요.' },
            { role: 'user', content: `다음은 사용자와 영화 캐릭터를 모방하는 챗봇의 대화입니다. 대화 흐름이 자연스럽고 적절하다면 "(예)"를, 그렇지 않다면 "(아니오)"와 함께 그 이유를 간단히 설명해주세요. 사용자의 질문: "${userMessage}", 영화 캐릭터를 모방하는 챗봇의 응답: "${botResponse}"` }
        ],
        temperature: 0.5,
        max_tokens: 100,
    });

    if (validationResponse.choices[0].message?.content == null) {
        console.error('Unexpected validation response format');
        return false;
    }

    const validationResult = validationResponse.choices[0].message.content.trim();
    console.log(`Validation result: ${validationResult}`);

    if (validationResult.toLowerCase().startsWith('(아니오)')) {
        console.log(`Validation failed. Reason: ${validationResult}`);
        return false;
    }

    return validationResult.toLowerCase().startsWith('(예)');
}

async function correctSpelling(text: string): Promise<string> {
    const correctionResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            { role: 'system', content: '당신은 전문 교정 편집자입니다. 주어진 텍스트의 맞춤법, 문법, 구두점을 교정해주세요. 단, 원래 의미와 맥락을 유지하면서 영화 캐릭터의 특징적인 말투나 표현은 그대로 보존해야 합니다. 답변은 교정된 텍스트만 주시면 됩니다. 따옴표 역시 필요 없습니다.' },
            { role: 'user', content: `다음 텍스트를 교정해주세요: "${text}"` }
        ],
        temperature: 0.5,
        max_tokens: 1000,
    });

    if (correctionResponse.choices[0].message?.content == null) {
        console.error('Unexpected correction response format');
        return text;
    }

    const correctedText = correctionResponse.choices[0].message.content.trim();

    console.log(`Corrected text: ${correctedText}`);
    return correctedText;
}

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
        const userMessages = messages.filter(msg => msg.role === 'user');
        const lastUserMessage = userMessages[userMessages.length - 1].content;

        const response = await openai.chat.completions.create({
            model: model,
            messages: messages,
            temperature: 0.01,
            max_tokens: 1000,
        });

        let botResponse = response.choices[0].message?.content;

        if (botResponse == null || botResponse === '') {
            const fallbackResponse = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: messages,
                temperature: 0.7,
                max_tokens: 1000,
            });
    
            console.log('Fallback response:', fallbackResponse.choices[0].message?.content);
    
            return fallbackResponse.choices[0].message?.content ?? "죄송합니다. 응답을 생성하는 동안 오류가 발생했습니다.";
        }

        botResponse = await correctSpelling(botResponse);

        if (await validateResponse(lastUserMessage, botResponse)) {
            return botResponse;
        }

        // 제대로 된 답을 못하면 gpt-4o로 답을 대체
        const fallbackResponse = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: messages,
            temperature: 0.7,
            max_tokens: 1000,
        });

        console.log('Fallback response:', fallbackResponse.choices[0].message?.content);

        return fallbackResponse.choices[0].message?.content ?? "죄송합니다. 응답을 생성하는 동안 오류가 발생했습니다.";
    } catch (error) {
        console.error('Error generating response:', error);
        return "죄송합니다. 응답을 생성하는 동안 오류가 발생했습니다.";
    }
}