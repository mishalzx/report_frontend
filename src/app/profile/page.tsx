import Profilepage from '@/components/profilesection/profilepage'
import React from 'react'
import { cookies } from 'next/headers';

const page = async () => {
        const authToken = (await cookies()).get("jwt")?.value || "";

  return (
    <div>
      <Profilepage authToken={authToken}/>
    </div>
  )
}

export default page
