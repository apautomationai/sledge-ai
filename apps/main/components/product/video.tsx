import Image from "next/image";

export function Video() {
  return (
    <div className="w-full px-6 md:px-8 lg:px-12 pb-12 md:pb-16">
      <div className="flex justify-center max-w-[1400px] mx-auto">
        <Image
          src="/images/product/Frame 89.png"
          alt="Product video preview"
          width={1344}
          height={815}
          className="rounded-lg"
        />
      </div>
    </div>
  );
}
