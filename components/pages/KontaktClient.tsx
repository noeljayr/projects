"use client";

import { useSearchParams } from "next/navigation";
import Banner from "@/components/Banner";
import EditableTextKontakt from "@/components/EditableTextKontakt";
import { KontaktContent } from "@/types/kontakt";
import {
  IconPhone,
  IconMail,
  IconMapPin,
  IconClock,
} from "@tabler/icons-react";

type Props = {
  content: KontaktContent;
};

export default function KontaktClient({ content }: Props) {
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("mode") === "edit";

  return (
    <>
      <Banner
        name={content.bannerTitle || "Kontakt"}
        description={
          content.bannerDescription ||
          "Haben Sie Fragen zu unseren Beaucerons oder möchten Sie uns kennenlernen? Wir freuen uns auf Ihre Nachricht!"
        }
        isEditMode={isEditMode}
        page="kontakt"
      />

      <div className="section-container mx-auto py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Contact Information Card */}
          <div className="bg-[#fff]/25 border border-[#BEA99A4D] rounded-[20px] p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-[#58483B] mb-6">
                Kontaktinformationen
              </h3>

              <div className="space-y-4">
                {/* Family Name */}
                <div className="flex items-start gap-3">
                  <div className="size-10 flex justify-center items-center bg-[#F1D4BB]/25 rounded-full shrink-0 mt-1">
                    <IconMapPin className="w-5 h-5 text-[#58483B]" />
                  </div>
                  <div className="flex flex-col">
                    <EditableTextKontakt
                      initialValue={content.familyName || "Familie Sauter"}
                      fieldName="familyName"
                      isEditMode={isEditMode}
                      className="text-base md:text-lg font-semibold text-black"
                      as="span"
                    />
                    <EditableTextKontakt
                      initialValue={content.addressLine1 || "Mühlerain 873"}
                      fieldName="addressLine1"
                      isEditMode={isEditMode}
                      className="text-sm md:text-base text-black/75"
                      as="span"
                    />
                    <EditableTextKontakt
                      initialValue={
                        content.addressLine2 || "CH-9116 Wolfertswil SG"
                      }
                      fieldName="addressLine2"
                      isEditMode={isEditMode}
                      className="text-sm md:text-base text-black/75"
                      as="span"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3">
                  <div className="size-10 flex justify-center items-center bg-[#F1D4BB]/25 rounded-full shrink-0">
                    <IconPhone className="w-5 h-5 text-[#58483B]" />
                  </div>
                  <EditableTextKontakt
                    initialValue={content.phone || "078 770 49 24"}
                    fieldName="phone"
                    isEditMode={isEditMode}
                    className="text-sm md:text-base text-[#58483B] hover:underline transition-all"
                    as="a"
                    href={`tel:${content.phone || "0787704924"}`}
                  />
                </div>

                {/* Email */}
                <div className="flex items-center gap-3">
                  <div className="size-10 flex justify-center items-center bg-[#F1D4BB]/25 rounded-full shrink-0">
                    <IconMail className="w-5 h-5 text-[#58483B]" />
                  </div>
                  <EditableTextKontakt
                    initialValue={content.email || "ti.genoveva@bluewin.ch"}
                    fieldName="email"
                    isEditMode={isEditMode}
                    className="text-sm md:text-base text-[#58483B] hover:underline transition-all break-all"
                    as="a"
                    href={`mailto:${content.email || "ti.genoveva@bluewin.ch"}`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Availability Card */}
          <div className="bg-[#58483B] rounded-[20px] p-6 md:p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              
              <EditableTextKontakt
                initialValue={content.availabilityTitle || "Erreichbarkeit"}
                fieldName="availabilityTitle"
                isEditMode={isEditMode}
                className="text-xl md:text-2xl font-bold text-white"
                as="h3"
              />
            </div>
            <EditableTextKontakt
              initialValue={
                content.availabilityText ||
                "Wir sind am besten telefonisch oder per E-Mail erreichbar. Bitte haben Sie Verständnis, dass wir nicht immer sofort antworten können, da wir uns intensiv um unsere Hunde kümmern. Wir melden uns so schnell wie möglich bei Ihnen zurück."
              }
              fieldName="availabilityText"
              isEditMode={isEditMode}
              className="text-white/90 text-sm md:text-base leading-relaxed font-p3"
              as="p"
              multiline
            />
          </div>
        </div>

        {/* Map Section
        <div className="mt-8 md:mt-12 bg-[#fff]/25 border border-[#BEA99A4D] rounded-[20px] overflow-hidden">
          <div className="aspect-video w-full">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2698.8!2d9.3!3d47.4!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDI0JzAwLjAiTiA5wrAxOCcwMC4wIkU!5e0!3m2!1sen!2sch!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Location Map"
            />
          </div>
        </div> */}
      </div>
    </>
  );
}
