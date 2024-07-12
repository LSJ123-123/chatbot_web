import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

// ProfileType 열거형 정의
export enum ProfileType {
  Member = 'member',
  Chatbot = 'chatbot',
}

// 각 데이터 타입을 인터페이스로 정의
interface MemberData {
  username: string;
  email: string;
  avatarUrl: string;
}

interface ChatbotData {
  name: string;
  made: string;
  chat_desc: string;
  imageUrl: string;
  content_desc : string;
  ott_link : string;
}

// ProfileProps 타입 정의
interface ProfileProps {
  type: ProfileType;
  data: MemberData | ChatbotData;
}

const Profile = ({ type, data }: ProfileProps) => {
  const isMember = type === ProfileType.Member;
  const name = isMember ? (data as MemberData).username : (data as ChatbotData).name;
  const imageUrl = isMember ? (data as MemberData).avatarUrl : (data as ChatbotData).imageUrl;

  return (
    <Card className="max-w-3xl mx-auto">
      <CardContent className="flex items-center p-6">
        <Avatar className="h-24 w-24 mr-6">
          <AvatarImage src={imageUrl} alt="Profile" />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardHeader className="p-0 mb-2">
            <h2 className="text-2xl font-bold">{name}</h2>
          </CardHeader>
          {isMember ? (
            <p className="text-sm text-gray-600">
              <strong>Email:</strong> {(data as MemberData).email}
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-2">
                 {(data as ChatbotData).made}
              </p>
              <p className="text-sm">{(data as ChatbotData).chat_desc}</p>
              <p className="text-sm">{(data as ChatbotData).content_desc}</p>
              <p className="text-sm">{(data as ChatbotData).ott_link}</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Profile;