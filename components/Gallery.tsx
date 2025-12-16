"use client";

import { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Upload } from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import paw from "@/public/pawprint.png";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  IconPlus,
  IconTrash,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";

type GalleryImage = {
  _id: string;
  imageUrl: string;
  alt: string;
  order?: number;
  createdAt?: Date;
};

type SiteImages = {
  darkSection1?: string;
  darkSection2?: string;
  darkSection3?: string;
  darkSection4?: string;
  gallery1?: string;
  gallery2?: string;
  gallery3?: string;
  whyBreedDog?: string;
};

type Props = {
  images: SiteImages;
  initialGalleryImages: GalleryImage[];
};

function Gallery({ images, initialGalleryImages }: Props) {
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("mode") === "edit";
  const galleryRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize gallery images from database or fallback to legacy images
  const [currentImages, setCurrentImages] = useState<GalleryImage[]>(() => {
    if (initialGalleryImages && initialGalleryImages.length > 0) {
      return initialGalleryImages;
    }
    // Fallback to legacy image structure
    return [
      {
        _id: "gallery1",
        imageUrl: images.gallery1 || "/section-2.1-img.png",
        alt: "Rottweiler puppies in field",
        order: 1,
      },
      {
        _id: "gallery2",
        imageUrl: images.gallery2 || "/section-2.2-img.png",
        alt: "Person with dogs in mountains",
        order: 2,
      },
      {
        _id: "gallery3",
        imageUrl: images.gallery3 || "/section-2.3-img.png",
        alt: "Dogs on mountain rocks",
        order: 3,
      },
    ];
  });

  // Fetch gallery images from database
  const fetchGalleryImages = async () => {
    try {
      const response = await fetch("/api/gallery");
      if (response.ok) {
        const galleryData = await response.json();
        setCurrentImages(galleryData);
      }
    } catch (error) {
      console.error("Error fetching gallery images:", error);
    }
  };

  useEffect(() => {
    if (initialGalleryImages && initialGalleryImages.length > 0) {
      setCurrentImages(initialGalleryImages);
    }
  }, [initialGalleryImages]);

  // Initialize slides per view based on screen size
  useEffect(() => {
    const updateSlidesPerView = () => {
      if (window.innerWidth >= 768) {
        setSlidesPerView(3);
      } else {
        setSlidesPerView(1);
      }
    };

    updateSlidesPerView();
    window.addEventListener("resize", updateSlidesPerView);

    return () => window.removeEventListener("resize", updateSlidesPerView);
  }, []);

  const handleAddImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      // Upload file to server
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/images/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      const { url } = await uploadResponse.json();

      // Add to gallery database
      const galleryResponse = await fetch("/api/gallery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: url,
          alt: `Gallery image ${currentImages.length + 1}`,
          order: currentImages.length,
        }),
      });

      if (!galleryResponse.ok) {
        throw new Error("Failed to add image to gallery");
      }

      // Refresh gallery images
      await fetchGalleryImages();
    } catch (error) {
      console.error("Error adding image:", error);
      alert("Failed to add image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/gallery/${imageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      // Refresh gallery images
      await fetchGalleryImages();
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Failed to delete image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <section className="section-container  relative py-12 pb-0 md:py-20 mx-auto mt-15">
      <Image
        src={paw}
        alt=""
        className="absolute w-25 -top-2 right-0 opacity-10 z-0"
      />
      <Image
        src={paw}
        alt=""
        className="absolute w-25 top-25 -right-40 opacity-10 z-0"
      />
      <Image
        src={paw}
        alt=""
        className="absolute w-25 top-25 rotate-[90deg] -left-40 opacity-10 z-0"
      />

      {isEditMode && (
        <button
          style={{
            transition: "ease 0.5s",
            fontSize: "calc(var(--p4) * 0.9)",
          }}
          onClick={!isLoading ? handleAddImage : undefined}
          disabled={isLoading}
          className="flex items-center mb-4 p-1.5 pr-2 cursor-pointer rounded-[0.35rem] border border-black/10 w-fit disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <IconPlus className="h-4 w-4 opacity-50 mr-1" />
          Bild
        </button>
      )}
      <div ref={galleryRef} className="relative z-1 mb-8 ">
        <div className="relative rounded-lg overflow-hidden">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={16}
            slidesPerView={1}
            navigation={false}
            pagination={false}
            autoplay={{
              delay: 10000,
              disableOnInteraction: false,
            }}
            onSwiper={(swiper) => setSwiperInstance(swiper)}
            onSlideChange={(swiper) => setActiveSlide(swiper.activeIndex)}
            onBreakpoint={(swiper, breakpointParams) => {
              const slides = breakpointParams.slidesPerView;
              setSlidesPerView(typeof slides === "number" ? slides : 1);
            }}
            breakpoints={{
              768: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
            }}
            className="gallery-swiper"
          >
            {currentImages.map((image) => (
              <SwiperSlide key={image._id}>
                <div className="relative aspect-square group">
                  <Image
                    src={image.imageUrl}
                    alt={image.alt}
                    fill
                    className="object-cover rounded-lg transition-all duration-500 "
                  />
                  {isEditMode && (
                    <button
                      onClick={() => handleDeleteImage(image._id)}
                      disabled={isLoading}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 h-8 w-8  flex items-center justify-center  cursor-pointer transition-opacity duration-200 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete image"
                    >
                      <IconTrash className="h4 w-4" />
                    </button>
                  )}
                </div>
              </SwiperSlide>
            ))}

            {isEditMode && (
              <SwiperSlide>
                <div
                  className="relative aspect-square cursor-pointer border-1 border-dashed border-gray-300 rounded-lg flex flex-col items-center mx-[1px] justify-center hover:border-gray-400 transition-colors duration-200 bg-[#FBF2EA]"
                  onClick={!isLoading ? handleAddImage : undefined}
                >
                  {isLoading ? (
                    <>
                      <div className="rounded-full h-8 w-8 border-b-2 border-gray-400 mb-2"></div>
                      <span className="text-gray-500 text-sm font-medium"></span>
                    </>
                  ) : (
                    <>
                      <Upload size={32} className="text-gray-400 mb-2" />
                      <span className="text-gray-500 text-sm font-medium">
                        Bild hinzufügen
                      </span>
                      <span className="text-gray-400 text-xs mt-1">
                        Zum Hochladen klicken
                      </span>
                    </>
                  )}
                </div>
              </SwiperSlide>
            )}
          </Swiper>

          {/* Custom Navigation Buttons */}
        </div>

        <div className="flex items-center w-full mt-4 px-1 relative">
          <button
            onClick={() => swiperInstance?.slidePrev()}
            disabled={!swiperInstance}
            className="left-2 z-10 h-8 w-8 bg-white/50 border border-black/15 hover:bg-white text-gray-700 hover:text-gray-900 rounded-full p-2 transition-all duration-200 backdrop-blur-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous slide"
          >
            <IconChevronLeft className="h-4 w-4" />
          </button>

          <button
            onClick={() => swiperInstance?.slideNext()}
            disabled={!swiperInstance}
            className="right-2 z-10 h-8 w-8 bg-white/50 border border-black/15 hover:bg-white text-gray-700 hover:text-gray-900 rounded-full ml-2 p-2 transition-all duration-200 backdrop-blur-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next slide"
          >
            <IconChevronRight className="h-4 w-4" />
          </button>

          <div className="flex justify-center ml-auto items-center space-x-2">
            {(() => {
              // Calculate how many pagination dots to show based on slides per view
              const totalSlides = currentImages.length + (isEditMode ? 1 : 0);
              const maxSlideIndex = Math.max(0, totalSlides - slidesPerView);
              const paginationCount =
                slidesPerView >= totalSlides ? 1 : maxSlideIndex + 1;

              return Array.from({ length: paginationCount }, (_, index) => (
                <button
                  key={index}
                  onClick={() => swiperInstance?.slideTo(index)}
                  disabled={!swiperInstance}
                  className={`h-3 rounded-full transition-all duration-300 cursor-pointer disabled:cursor-not-allowed ${
                    activeSlide === index
                      ? "bg-[#58483b] w-6"
                      : "border w-3 border-black/15"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ));
            })()}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isLoading}
          className="hidden"
        />
      </div>
    </section>
  );
}

export default Gallery;
