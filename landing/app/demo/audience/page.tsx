"use client";
import { AudienceView } from "@khriztianmoreno/speaker-kit";
import { DEMO_SLIDES } from "../_slides";

export default function DemoAudiencePage() {
  return (
    <AudienceView
      slides={DEMO_SLIDES}
      channel="sk-live-demo"
    />
  );
}
