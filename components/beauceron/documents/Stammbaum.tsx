"use client";

import React from "react";
import DocumentUpload from "./DocumentUpload";

type DeleteModalState = {
  isOpen: boolean;
  fileId: string;
  filename: string;
  onDeleteSuccess: () => void;
} | null;

type Props = {
  close: () => void;
  setDeleteModalState: (state: DeleteModalState) => void;
};

function Stammbaum({ close, setDeleteModalState }: Props) {
  return (
    <DocumentUpload
      close={close}
      type="stammbaum"
      setDeleteModalState={setDeleteModalState}
    />
  );
}

export default Stammbaum;
