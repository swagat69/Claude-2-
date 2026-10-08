"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/button/Button";
import { Notice } from "@/components/feedback/Notice";
import { ToastProvider, useToast } from "@/components/feedback/Toast";
import { Dialog } from "@/components/overlay/Dialog";
import specimen from "../_doc/specimen.module.css";

export function DismissibleNoticeDemo() {
  const [visible, setVisible] = useState(true);
  return visible ? (
    <Notice tone="info" title="You can leave and come back" onDismiss={() => setVisible(false)}>
      Your answers are saved as you go. Use the link we send you to pick up where you left off.
    </Notice>
  ) : (
    <div className={specimen.demoRow}>
      <Button variant="secondary" size="compact" onClick={() => setVisible(true)}>
        Show the notice again
      </Button>
    </div>
  );
}

function ToastButtons() {
  const { show } = useToast();
  return (
    <div className={specimen.demoRow}>
      <Button onClick={() => show("Your answers are saved.")}>Save my answers</Button>
      <Button variant="secondary" onClick={() => show("Link copied.", { tone: "info" })}>
        Copy my resume link
      </Button>
    </div>
  );
}

export function ToastDemo() {
  return (
    <ToastProvider>
      <ToastButtons />
    </ToastProvider>
  );
}

export function DialogDemo() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [cleared, setCleared] = useState(false);
  const keepButton = useRef<HTMLButtonElement>(null);

  return (
    <div className={specimen.stack}>
      <div className={specimen.demoRow}>
        <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
          Start again
        </Button>
        <Button variant="tertiary" onClick={() => setInfoOpen(true)}>
          How we use your information
        </Button>
      </div>
      <p role="status" className={specimen.demoStatus}>
        {cleared ? "Answers cleared (demo only)." : ""}
      </p>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Start again?"
        description="This clears the answers you’ve given so far. You can’t undo it."
        size="small"
        initialFocus={keepButton}
        footer={
          <>
            <Button
              variant="destructive"
              onClick={() => {
                setCleared(true);
                setConfirmOpen(false);
              }}
            >
              Clear my answers
            </Button>
            <Button ref={keepButton} variant="secondary" onClick={() => setConfirmOpen(false)}>
              Keep my answers
            </Button>
          </>
        }
      />

      <Dialog
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        title="How we use your information"
        footer={<Button onClick={() => setInfoOpen(false)}>Got it</Button>}
      >
        <div className={specimen.prose}>
          <p>
            We use your answers to work out which loan routes may suit you, and to contact you about this request
            by the channel you choose.
          </p>
          <p>
            We only ask for what we need, and each question says why. You can review and change every answer
            before you send it.
          </p>
          <p>
            Placeholder text: the approved privacy wording, data retention period and lender-sharing terms go
            here once legal has signed them off.
          </p>
        </div>
      </Dialog>
    </div>
  );
}
