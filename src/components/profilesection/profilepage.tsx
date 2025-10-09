'use client'
import React, { useEffect, useState } from 'react'
import { UserService } from '../../../api';

interface MemberData {
    id: string;
    username: string;
    email: string;
}

interface ProfileSectionProps {
    authToken: string;
}
const Profilepage: React.FC<ProfileSectionProps> = ({ authToken }) => {
 const [memberData, setMemberData] = useState<MemberData | null>(null);
    const tkn = authToken;
 const fetchMemberData = async () => {
        try {
            const params = {};
            const res = await UserService.usergetmeDetails(params, tkn);
            setMemberData(res);
            console.log("Member data fetched:", res);
        } catch (error) {
            console.error("Error fetching member data:", error);
        }
    };

    useEffect(() => {
        fetchMemberData();
    }, []);

  return (
    <div>
      
    </div>
  )
}

export default Profilepage
