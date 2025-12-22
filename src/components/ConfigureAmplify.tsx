"use client";

import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";

// Configuramos Amplify una sola vez del lado del cliente
Amplify.configure(outputs, { ssr: true });

export default function ConfigureAmplifyClientSide() {
  return null;
}
