"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Gamepad2 } from "lucide-react";

interface BannerSlide {
  id: number;
  image: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

const bannerSlides: BannerSlide[] = [
  {
    id: 1,
    image: "/images/banner1.jpg",
    title: "Siêu khuyến mãi",
    description: "Giảm giá lên đến 30% toàn bộ sản phẩm lego",
    buttonText: "MUA NGAY",
    buttonLink: "/product"
  },
  {
    id: 2,
    image: "/images/photo-1583804227715-93acfe95fb37.jpg",
    title: "Ưu đãi đặc biệt",
    description: "Mua 2 tặng 1 - Cơ hội không thể bỏ lỡ",
    buttonText: "XEM NGAY",
    buttonLink: "/product"
  },
  {
    id: 3,
    image: "/images/caro1.jpg",
    title: "Trò chơi Cờ Caro",
    description: "Thư giãn với game cờ caro thú vị! Chơi với bạn bè hoặc thử thách AI",
    buttonText: "CHƠI NGAY",
    buttonLink: "/caro"
  },
  {
    id: 4,
    image: "/images/banner2.jpg",
    title: "",
    description: "",
    buttonText: "",
    buttonLink: "/product"
  }
];

export default function BannerCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide mỗi 3 giây
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Chuyển slide thủ công
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Chuyển slide tiếp theo
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  // Chuyển slide trước đó
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  return (
    <div className="w-full relative">
      <div className="relative h-[500px] w-full overflow-hidden">
        {/* Slides container */}
        <div 
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {bannerSlides.map((slide) => (
            <div key={slide.id} className="w-full h-full flex-shrink-0 relative">
              {/* Layout thống nhất cho tất cả slides */}
              <>
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority
                  quality={100}
                  className="object-fill brightness-110"
                  sizes="100vw"
                />
                
                {/* Overlay để text rõ hơn */}
                <div className="absolute inset-0 bg-black/10 z-5"></div>
                
                {/* Nội dung trên banner */}
                <div className={`relative z-10 flex flex-col h-full px-4 py-12 ${
                  slide.id === 3 
                    ? 'items-start text-left lg:px-16 lg:justify-center ml-10' // Căn trái cho slide caro
                    : 'items-center justify-center text-center' // Căn giữa cho các slide khác
                }`}>
                  {/* Icon đặc biệt cho slide caro */}
                  {slide.id === 3 && (
                    <div className="flex items-center justify-center lg:justify-start mb-4">
                      <div className="bg-blue-900 p-4 rounded-full shadow-lg">
                        <Gamepad2 className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  )}
                  
                  <h1 className={`text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg ${
                    slide.id === 3 
                      ? 'text-blue-900' 
                      : 'text-white'
                  }`}>
                    {slide.title}
                  </h1>
                  
                  <p className={`text-xl mb-8 max-w-2xl drop-shadow md:text-2xl ${
                    slide.id === 3 ? 'text-blue-800' : 'text-white'
                  }`}>
                    {slide.description}
                  </p>
                  
                  <Button className={`font-bold text-lg px-8 py-4 rounded-lg shadow-lg transition-all hover:scale-105 flex items-center ${
                    slide.id === 3
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white'
                      : 'bg-yellow-400 hover:bg-yellow-500 text-black'
                  }`}>
                    <Link href={slide.buttonLink} className="flex items-center">
                      {slide.id === 3 && <Gamepad2 className="w-5 h-5 mr-2" />}
                      {slide.buttonText}
                    </Link>
                  </Button>
                </div>
              </>
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
          aria-label="Previous slide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
          aria-label="Next slide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide 
                  ? 'bg-yellow-400 scale-125' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
