import React, { useRef, useState } from 'react';

interface Experience {
  id: number;
  image: string;
  label: string;
  title: string;
  description: string;
}

const experiences: Experience[] = [
  {
    id: 1,
    image: 'https://private-us-east-1.manuscdn.com/sessionFile/rRG3fm5GFqocsddQOrSxiV/sandbox/RqWxSJpF1uuNnfn6JOkQeY-img-1_1770361606000_na1fn_c2Vhc29uYWwtd2ludGVyLXN1bg.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvclJHM2ZtNUdGcW9jc2RkUU9yU3hpVi9zYW5kYm94L1JxV3hTSnBGMXV1Tm5mbjZKT2tRZVktaW1nLTFfMTc3MDM2MTYwNjAwMF9uYTFmbl9jMlZoYzI5dVlXd3RkMmx1ZEdWeUxYTjFiZy5qcGc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=rReyvoPWweEdhNU4qXKP4YHZarpVzCjILaUmfF42qD01tVdme2bBHDnowJSlLu-Vpw733xiY6-rY6h9LJn8fmeK-96g0dumw740pOypk6Xc7M~j61GY0stX1Yrs0zmAR70CpgxM6jUZw7-FsUQNM8vE1JgaGfc1k9vAnUgI1Jxwa6J0R3qCfN2BWdOJLBWqRIOGymNoZB-eOlFkRcH4K6LRK6BgWOSp2im1-IE0kd0OAAPAfbY2qp05OMyIoxfrukOsfUUstL5S~Fx8JHtEJ3OrzR2ARkWGiApD4tz1qRrf3rQDmN-a-I-6YIxFbOKTcBINv~j2z~SPjlo~xFOA9pA__',
    label: 'WINTER SUN',
    title: 'Chasing Sunlight',
    description: 'Discover a curated collection of winter sun retreats with Aman.'
  },
  {
    id: 2,
    image: 'https://private-us-east-1.manuscdn.com/sessionFile/rRG3fm5GFqocsddQOrSxiV/sandbox/RqWxSJpF1uuNnfn6JOkQeY-img-2_1770361608000_na1fn_c2Vhc29uYWwtd2ludGVyLWFkdmVudHVyZXM.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvclJHM2ZtNUdGcW9jc2RkUU9yU3hpVi9zYW5kYm94L1JxV3hTSnBGMXV1Tm5mbjZKT2tRZVktaW1nLTJfMTc3MDM2MTYwODAwMF9uYTFmbl9jMlZoYzI5dVlXd3RkMmx1ZEdWeUxXRmtkbVZ1ZEhWeVpYTS5qcGc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=YOybaa3~YvovO1m~kwEheetP7TRFMXjQkYj6NjYddooW6gXTrM-qEFEQ~kr8W1uPhJWd4CZtPdtU66j52dO8moGMUfho2g7rdCst7rY0RC16sdetTEWd-d-0T8jL4L2sVZfuEXZi2Jc46nK7SXSEFtp7KJK1wiipjLKiE~aZLOp4Lorx7YwJaUjF-AAvJ8j8jYaUMOXNh3HcD2mfmqYUOI2Gpwh0bfj2z2xEJDVLmWGpk07Sx52cK-DzouQvJjGvTEpVUHCatGyCoi5SEZNBulnLp4J0~zywWE9aqwIYWiUYNdmKO9buDxUBA4HEoLKG6QtHEJs6JkkBWcO2P-W2-w__',
    label: 'WINTER ADVENTURES',
    title: 'In the Mountains',
    description: 'At Aman destinations in France and Italy, the winter season welcomes ski adventures.'
  },
  {
    id: 3,
    image: 'https://private-us-east-1.manuscdn.com/sessionFile/rRG3fm5GFqocsddQOrSxiV/sandbox/RqWxSJpF1uuNnfn6JOkQeY-img-3_1770361602000_na1fn_c2Vhc29uYWwtY2l0eS1lc2NhcGVz.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvclJHM2ZtNUdGcW9jc2RkUU9yU3hpVi9zYW5kYm94L1JxV3hTSnBGMXV1Tm5mbjZKT2tRZVktaW1nLTNfMTc3MDM2MTYwMjAwMF9uYTFmbl9jMlZoYzI5dVlXd3RZMmwwZVMxbGMyTmhjR1Z6LmpwZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=lR6usGteS46qoxPo8hrKvBmyMxoR4JnPFSSMA50-jn-hQgsikezqnnxAfBePamIvM9SeFsdwSSjJ0TlJik54UVrrZvZXp2QCuaZ2gEiy5w94vDKFCucVlgYNB32GdKp1SAmuzqkEVFGlcd0CWnowN8l0cC-bT6ZO3htQImcIPO4yhvpod9DmPfTlU-zYHX4EaVEsrlsLCBiTvwehrti2~U~QIiLbxqMXgPPQUcwSb6vpvzQ2Af1ZBF~pEEiJsFCUzKSNDRUSV~PNSNeQFFqiq7b5laKJCerJZvrYmOq5hWrQsGd0LEVAFXwcW2y524DritnYOcrFI3qaajAcFyI-Ow__',
    label: 'CITY ESCAPES',
    title: 'In the City',
    description: 'The gilded city skyline cultural discovery at every turn.'
  }
];

export default function SeasonalExperiences() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollContainerRef.current?.offsetLeft || 0));
    setScrollLeft(scrollContainerRef.current?.scrollLeft || 0);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (scrollContainerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 1;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  return (
    <section className="w-full bg-[#F5F3EF] py-16 md:py-24">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
        {/* Header Section */}
        <div className="mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-normal text-black mb-6">
            Seasonal Experiences
          </h2>
          <p className="text-base leading-relaxed text-gray-700 font-light max-w-2xl">
            Across the Aman world, discover new and noteworthy experiences that provide an authentic connection to the soul of a place.
          </p>
        </div>

        {/* Carousel Section - Draggable */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scroll-smooth pb-4 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            style={{ scrollBehavior: 'smooth', userSelect: 'none' }}
          >
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="flex-shrink-0 w-80 group cursor-pointer select-none pointer-events-none"
              >
                {/* Image Container */}
                <div className="relative overflow-hidden rounded-lg bg-black mb-6" style={{ aspectRatio: '1 / 1' }}>
                  <img
                    src={exp.image}
                    alt={exp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Content */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-600 font-light mb-3">
                    {exp.label}
                  </p>
                  <h3 className="font-body text-2xl font-bold text-black mb-3">
                    {exp.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-700 font-light">
                    {exp.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
