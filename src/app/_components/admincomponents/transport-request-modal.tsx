import { Grid, GridCol, Group, Modal as MantineModal, Text, Textarea } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Rating1 from "@/assets/icons/rating1";
import Rating2 from "@/assets/icons/rating2";
import Rating3 from "@/assets/icons/rating3";
import Rating4 from "@/assets/icons/rating4";
import Rating5 from "@/assets/icons/rating5";
import Button from "../common/button/Button";
import ui from "./transport-request-modal.module.scss";

interface TransportRequestProps {
  isOpen: boolean;
  onClose: (...args: any[]) => void;
  onDecline: (...args: any[]) => void;
  onApprove: (...args: any[]) => void;
  agencyName: string;
  residentName: string;
  contactInfo: string;
  additionalInfo: string;
  dateAndTime: string;
  purpose: string;
  destinationAddress: string;
  transportRating?: 1 | 2 | 3 | 4 | 5;
  prevDriverNotes?: string;
  requestedDiffLocation?: boolean;
}

export default function TransportRequestModal({
  isOpen,
  onClose,
  onDecline,
  onApprove,
  agencyName,
  residentName,
  contactInfo,
  additionalInfo,
  dateAndTime,
  purpose,
  destinationAddress,
  transportRating,
  prevDriverNotes,
  requestedDiffLocation,
}: TransportRequestProps) {
  const isMobile = useMediaQuery("(max-width: 50em)");
  let showPastHistory = true;

  if (!transportRating || !prevDriverNotes || !requestedDiffLocation) {
    //One of the optional fields left blank
    showPastHistory = false;
  }

  return (
    <MantineModal
      opened={isOpen}
      onClose={onClose}
      title={
        <div>
          <Text className={ui.title}>Review Transport Request</Text>
          <Text className={ui.agencyName}>Request from {agencyName}</Text>
        </div>
      }
      size={"lg"}
      fullScreen={isMobile}
      padding="xl"
      withCloseButton={true}
      closeOnClickOutside={true}
      closeOnEscape={true}
      transitionProps={{ transition: "slide-left" }}
    >
      <Text className={ui.fieldHeadings}>Personal Information</Text>

      <Grid gutter={"xl"} className={ui.grid}>
        <GridCol span={4}>
          <Textarea variant="unstyled" readOnly autosize maxRows={2} value={"Resident Name"} />
        </GridCol>

        <GridCol span={8}>
          <Textarea readOnly autosize maxRows={2} value={residentName} />
        </GridCol>
      </Grid>

      <Grid gutter={"xl"} className={ui.grid}>
        <GridCol span={4}>
          <Textarea variant="unstyled" readOnly autosize maxRows={2} value={"Contact Info"} />
        </GridCol>

        <GridCol span={8}>
          <Textarea readOnly autosize maxRows={2} value={contactInfo} />
        </GridCol>
      </Grid>

      <Grid gutter={"xl"} className={ui.grid}>
        <GridCol span={4}>
          <Textarea
            variant="unstyled"
            readOnly
            rows={5}
            value={
              "Additional Information (pets, personal belongings, support required entering / exiting vehicle, etc.)"
            }
          />
        </GridCol>

        <GridCol span={8}>
          <Textarea readOnly rows={5} value={additionalInfo} />
        </GridCol>
      </Grid>

      <Text className={ui.fieldHeadings}>Logistics</Text>

      <Grid gutter={"xl"} className={ui.grid}>
        <GridCol span={4}>
          <Textarea
            variant="unstyled"
            readOnly
            autosize
            maxRows={3}
            minRows={2}
            value={"Date and Time of Transport"}
          />
        </GridCol>

        <GridCol span={8}>
          <Textarea readOnly autosize maxRows={3} value={dateAndTime} />
        </GridCol>
      </Grid>

      <Grid gutter={"xl"} className={ui.grid}>
        <GridCol span={4}>
          <Textarea variant="unstyled" readOnly autosize maxRows={2} value={"Purpose"} />
        </GridCol>

        <GridCol span={8}>
          <Textarea readOnly autosize maxRows={5} value={purpose} />
        </GridCol>
      </Grid>

      <Grid gutter={"xl"} className={ui.grid}>
        <GridCol span={4}>
          <Textarea
            variant="unstyled"
            readOnly
            autosize
            maxRows={2}
            value={"Destination Address"}
          />
        </GridCol>

        <GridCol span={8}>
          <Textarea readOnly autosize maxRows={2} value={destinationAddress} />
        </GridCol>
      </Grid>

      {showPastHistory && (
        <>
          <Text className={ui.pastHistoryHeading}>Past History</Text>
          <Textarea
            variant="unstyled"
            readOnly
            autosize
            className={ui.grid}
            value={
              "This resident has previously used the Navigation Centre's services.\nView the details from their previous ride below."
            }
          />

          <Grid gutter={"xl"} className={ui.grid}>
            <GridCol span={4}>
              <Textarea
                variant="unstyled"
                readOnly
                autosize
                maxRows={2}
                value={"Transport fitness rating"}
              />
            </GridCol>

            <GridCol span={8}>
              <Group gap={"xs"}>
                {transportRating === 1 && (
                  <>
                    <Rating1 />
                    <Text className={ui.ratingText}>Poor</Text>
                  </>
                )}
                {transportRating === 2 && (
                  <>
                    <Rating2 />
                    <Text className={ui.ratingText}>Okay</Text>
                  </>
                )}
                {transportRating === 3 && (
                  <>
                    <Rating3 />
                    <Text className={ui.ratingText}>Standard</Text>
                  </>
                )}
                {transportRating === 4 && (
                  <>
                    <Rating4 />
                    <Text className={ui.ratingText}>Good</Text>
                  </>
                )}
                {transportRating === 5 && (
                  <>
                    <Rating5 />
                    <Text className={ui.ratingText}>Excellent</Text>
                  </>
                )}
              </Group>
            </GridCol>
          </Grid>

          <Grid gutter={"xl"} className={ui.grid}>
            <GridCol span={4}>
              <Textarea
                variant="unstyled"
                readOnly
                autosize
                maxRows={4}
                value={"Previous driver notes"}
              />
            </GridCol>

            <GridCol span={8}>
              <Textarea readOnly autosize maxRows={4} value={prevDriverNotes} />
            </GridCol>
          </Grid>

          <Grid gutter={"xl"} className={ui.grid}>
            <GridCol span={4}>
              <Textarea
                variant="unstyled"
                readOnly
                rows={5}
                value={
                  "Did the passenger request to be dropped off at a different location than originally booked?"
                }
              />
            </GridCol>

            <GridCol span={8}>
              <Textarea readOnly rows={1} value={requestedDiffLocation ? "Yes" : "No"} />
            </GridCol>
          </Grid>
        </>
      )}

      <Group justify="flex-end" mt="md">
        <Button variant="secondary" onClick={onDecline}>
          {"Decline Booking"}
        </Button>
        <Button onClick={onApprove}>{"Approve Booking"}</Button>
      </Group>
    </MantineModal>
  );
}
