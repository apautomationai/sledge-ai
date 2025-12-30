import Image from "next/image";

export function Video() {
  return (
    <div className="flex justify-center px-4 sm:px-6 md:px-12 lg:px-20 ">
      <Image
        src="/images/product/Frame 89.png"
        alt="Product video preview"
        width={1344}
        height={815}
        className="rounded-lg"
      />
    </div>
  );
}
