interface WhatIsItProps {
  title?: string;
  description?: string;
}

export default function WhatIsIt({ title, description }: WhatIsItProps) {
  if (!title && !description) {
    return null;
  }

  return (
    <div className="bg-[#141414] px-6 md:px-8 lg:px-12 py-12 md:py-16">
      <div className="mx-auto max-w-[1400px]">
        <div className="text-center">
          {title && (
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white uppercase font-['League_Spartan']">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-2 text-base lg:text-lg text-white">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
