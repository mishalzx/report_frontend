import Module1Survey from '@/components/Module1survey/Module1survey'
import { cookies } from 'next/headers';
import React from 'react'

const page = async () => {
      const authToken = (await cookies()).get("jwt")?.value || "";

  return (
    <div>
      <Module1Survey authToken={authToken}/>
    </div>
  )
}

export default page
