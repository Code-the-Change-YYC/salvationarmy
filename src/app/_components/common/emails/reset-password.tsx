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

interface ResetPasswordProps {
  resetUrl: string;
  userEmail: string;
  username?: string;
}

const ResetPasswordEmailTemplate = ({ resetUrl, userEmail, username }: ResetPasswordProps) => {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Reset your password - Salvation Army Navigation Center</Preview>

      <Body className="email-body">
        <Container className="email-container">
          <Section className="section-center">
            <Heading className="heading-main">Reset Your Password</Heading>
            <Text className="text-lg">Secure your account with a new password</Text>
          </Section>

          <Section className="section-default">
            <Text className="text-base">Hi {username},</Text>

            <Text className="text-base">
              You requested a password reset for your Salvation Army Navigation Center account
              associated with <strong>{userEmail}</strong>.
            </Text>

            <Text className="text-base">
              Click the button below to reset your password. This link will expire in 1 hour for
              security purposes.
            </Text>

            <Section className="section-center">
              <Button href={resetUrl} className="button-primary">
                Reset Password
              </Button>
            </Section>

            <Text className="text-small">Or copy and paste this link into your browser:</Text>
            <Text className="text-small-blue">{resetUrl}</Text>
            <Text className="text-base">
              If you didn't request this reset, you can safely ignore this email.
            </Text>
          </Section>

          <Section className="section-border-top section-center">
            <Text className="text-small">
              This email was sent to {userEmail} from the Salvation Army Navigation Booking System.
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

export default ResetPasswordEmailTemplate;
