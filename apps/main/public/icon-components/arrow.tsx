import * as React from "react";

const Arrow: React.FC<React.SVGProps<SVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="24"
    fill="none"
    viewBox="0 0 32 24"
  >
    <path
      fill="#EDECEB"
      d="M12 24 0 12 12 0l2.8 2.9L7.7 10H32v4H7.7l7.1 7.1z"
    ></path>
  </svg>
);

export default Arrow;
