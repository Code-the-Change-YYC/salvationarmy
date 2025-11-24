import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import "./emails-module.scss";

interface RegisterAccountProps {
  username: string;
  resetUrl: string;
  userEmail: string;
}

const RegisterAccountEmailTemplate = ({ username, resetUrl, userEmail }: RegisterAccountProps) => {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Register your account - Salvation Army Navigation Center</Preview>

      <Body className="email-body">
        <Container className="email-container">
          <Section className="section-center">
            <Heading className="heading-main">Register Your Account</Heading>
            <Text className="text-lg">Secure your account with a new password</Text>
          </Section>

          <Section className="section-default">
            <Text className="text-base">Hi {username},</Text>

            <Text className="text-base">
              You were recently invited to register your Salvation Army Navigation Center account
              associated with <strong>{userEmail}</strong>.
            </Text>

            <Text className="text-base">
              Click the button below to create your account by setting a new password. This link
              will expire in 1 hour for security purposes.
            </Text>

            <Section className="section-center">
              <Button href={resetUrl} className="button-primary">
                Register Account
              </Button>
            </Section>

            <Text className="text-small">Or copy and paste this link into your browser:</Text>

            <Text className="text-small-blue">{resetUrl}</Text>
          </Section>

          <Section className="section-default">
            <Text className="text-base">Having trouble with the reset process?</Text>
            <Text className="text-small-blue">Contact our support team for assistance</Text>
          </Section>

          <Section className="section-border-top section-center">
            <Text className="text-small">
              This email was sent to {userEmail} because you were invited to Salvation Army
              Navigation Booking System.
            </Text>

            <Text className="text-xs">Salvation Army Navigation Center Security Team</Text>
            <Text className="text-xs">
              © {new Date().getFullYear()} Salvation Army Navigation Center. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default RegisterAccountEmailTemplate;
