"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Col, Container, Row, Stack } from "react-bootstrap";
import logo from "../../../public/Ariflex Logo-01.png";
import bgimage from "../../../public/bgimage.jpg";

interface LoginLayoutProps {
  title: string;
  subTitle: string;
  children: ReactNode;
}

const LeftPanel = ({ title, subTitle, children }: LoginLayoutProps) => {
  return (
    <Col className="px-4 px-md-0">
      <Stack className="px-md-5 h-100 auth-bg">
        <Stack className="align-items-flex-start">
          <Stack
            direction="horizontal"
            className="align-items-center justify-content-between py-5"
          >
            <Image
              src={logo}
              alt="Ariflex logo"
              width={128}
              height={49}
              priority
            />
          </Stack>
          <Stack className="mt-5">
            <h1 className="fw-medium">{title}</h1>
            <div className="head_description  ff-questrial">{subTitle}</div>
            <div className="">{children}</div>
          </Stack>
        </Stack>
      </Stack>
    </Col>
  );
};

const RightPanel = () => {
  return (
    <>
      <Col className="d-none d-sm-none d-md-block p-0">
        <div
          className="position-relative w-100 h-100"
          style={{ minHeight: "100%" }}
        >
          <Image
            src={bgimage}
            alt="Background"
            fill
            style={{ objectFit: "cover", zIndex: 0 }}
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
          />
          <div
            className="overlay position-absolute top-0 start-0 w-100 h-100"
            style={{ zIndex: 1 }}
          >
            <Stack className="align-items-center justify-content-end text-white h-100 p-5 mx-4 text-center">
              <p className="h1 head_content">
                Where back-office teams get work done
              </p>
              <div className="line"></div>
              <p className="h6 mt-2 pt-3 ff-questrial head_content">
                The online collaboration platform to bring teams
                together,anytime,anywhere.
              </p>
            </Stack>
          </div>
        </div>
      </Col>
    </>
  );
};

const AuthLayout = ({ children, title, subTitle }: LoginLayoutProps) => {
  // Animation: fade in on route change (pathname)
  const pathname = usePathname();
  const [animate, setAnimate] = useState(true);
  const animateTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setAnimate(true);
    if (animateTimeout.current) clearTimeout(animateTimeout.current);
    animateTimeout.current = setTimeout(() => setAnimate(false), 500);
    return () => {
      if (animateTimeout.current) clearTimeout(animateTimeout.current);
    };
  }, [pathname]);

  return (
    <Container>
      <Row style={{ height: "100vh" }} className="py-5">
        <>
          <LeftPanel title={title} subTitle={subTitle}>
            <div
              className={`client-shell-animator${
                animate ? " animated-element" : ""
              }`}
              key={pathname}
            >
              {children}
            </div>
          </LeftPanel>
          <RightPanel />
        </>
      </Row>
    </Container>
  );
};

export default AuthLayout;
