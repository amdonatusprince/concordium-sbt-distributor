import * as React from "react";
import { Html, Button, Container } from "@react-email/components";

export const EmailTemplate = ({ emailContent }: any) => (
  <Html>
    <Container>
      <body>
        <div dangerouslySetInnerHTML={{ __html: emailContent }} />
      </body>
    </Container>
  </Html>
);
