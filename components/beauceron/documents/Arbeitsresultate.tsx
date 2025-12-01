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

function Arbeitsresultate({ close, setDeleteModalState }: Props) {
  return (
    <DocumentUpload
      close={close}
      type="arbeitsresultate"
      setDeleteModalState={setDeleteModalState}
    />
  );
}

export default Arbeitsresultate;
