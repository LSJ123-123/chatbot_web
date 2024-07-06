import React from 'react';

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
  description: string;
  imageUrl: string;
}

// ProfileProps 타입 정의
interface ProfileProps {
  type: ProfileType; // type을 ProfileType으로 지정
  data: MemberData | ChatbotData;
}

const Profile = ({ type, data } : ProfileProps) => {
  return (
    <div className="profile">
      {/* type 값에 따라 다른 형태의 프로필을 표시 */}
      {type === ProfileType.Member && (
        <>
          <img src={(data as MemberData).avatarUrl} alt={(data as MemberData).username} className="avatar" />
          <div className="details">
            <h2>{(data as MemberData).username}</h2>
            <p><strong>Email:</strong> {(data as MemberData).email}</p>
          </div>
        </>
      )}
      {type === ProfileType.Chatbot && (
        <>
          <img src={(data as ChatbotData).imageUrl} alt={(data as ChatbotData).name} className="avatar" />
          <div className="details">
            <h2>{(data as ChatbotData).name}</h2>
            <p><strong>만들어진 날짜:</strong> {(data as ChatbotData).made}</p>
            <p>{(data as ChatbotData).description}</p>
          </div>
        </>
      )}
      <style jsx>{`
        .profile {
          display: flex;
          align-items: center;
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          margin-right: 20px;
        }
        .details {
          flex: 1;
        }
        h2 {
          margin-top: 0;
        }
        p {
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
};

export default Profile;
