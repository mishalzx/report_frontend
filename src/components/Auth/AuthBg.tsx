import Image from "next/image";
import authbg from "../../../public/bf82a8ee8d.jpg";

const Authbg = () => {
  return (
    <div className="img-background">
      <Image src={authbg} alt="authbg" />
      <div className="img-overlay"></div>
    </div>
  );
};

export default Authbg;
