import { DocumentTable } from "../../components/DocumentTable/DocumentTable";
import { UploadBox } from "../../components/UploadBox/UploadBox";
import usePageMetadata from "../../hooks/usePageMetadata";

const ManagementDocument = () => {
  usePageMetadata({
    title: "Compliance Processor | Documentos",
    description:
      "Sube y administra tus documentos para cumplir con los controles de auditoría y gobernanza.",
    keywords: "documentos, compliance, auditoría, upload, gestión documental",
  });

  return (
    <>
      <UploadBox />
      <DocumentTable />
    </>
  );
};

export default ManagementDocument;
