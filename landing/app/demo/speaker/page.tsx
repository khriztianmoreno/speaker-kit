"use client";
import { SpeakerView } from "@khriztianmoreno/speaker-kit";
import { DEMO_SLIDES, DEMO_NOTES } from "../_slides";

export default function DemoSpeakerPage() {
  return (
    <SpeakerView
      slides={DEMO_SLIDES}
      notes={DEMO_NOTES}
      channel="sk-live-demo"
    />
  );
}
