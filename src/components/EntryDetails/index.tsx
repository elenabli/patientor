import {
  Entry,
  HealthCheckEntry,
  HospitalEntry,
  OccupationalHealthcareEntry,
  Diagnosis,
  HealthCheckRating,
} from "../../types";
import { Favorite, LocalHospital, Work } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";

interface EntryDetailsProps {
  entry: Entry;
  diagnoses: Diagnosis[];
}

const assertNever = (value: never): never => {
  throw new Error(`Unhandled entry type: ${JSON.stringify(value)}`);
};

const DiagnosisList: React.FC<{
  codes?: Array<Diagnosis["code"]>;
  diagnoses: Diagnosis[];
}> = ({ codes, diagnoses }) => {
  if (!codes || codes.length === 0) return null;

  const findDiagnosis = (code: string) =>
    diagnoses.find((d) => d.code === code);

  return (
    <ul>
      {codes.map((code) => {
        const diag = findDiagnosis(code);
        return (
          <li key={code}>
            {code} {diag ? diag.name : ""}
          </li>
        );
      })}
    </ul>
  );
};

const HealthCheckEntryView: React.FC<{
  entry: HealthCheckEntry;
  diagnoses: Diagnosis[];
}> = ({ entry, diagnoses }) => {
  const heartColor = (rating: HealthCheckRating) => {
    switch (rating) {
      case HealthCheckRating.Healthy:
        return "green";
      case HealthCheckRating.LowRisk:
        return "yellow";
      case HealthCheckRating.HighRisk:
        return "orange";
      case HealthCheckRating.CriticalRisk:
        return "red";
      default:
        return "grey";
    }
  };

  return (
    <Box border={1} borderRadius={2} p={1} mb={1}>
      <Typography variant="subtitle1">
        {entry.date} <LocalHospital fontSize="small" />
      </Typography>
      <Typography variant="body2" component="em">
        {entry.description}
      </Typography>
      <DiagnosisList codes={entry.diagnosisCodes} diagnoses={diagnoses} />
      <Favorite
        fontSize="small"
        style={{ color: heartColor(entry.healthCheckRating) }}
      />
      <Typography variant="body2">diagnosed by {entry.specialist}</Typography>
    </Box>
  );
};

const HospitalEntryView: React.FC<{
  entry: HospitalEntry;
  diagnoses: Diagnosis[];
}> = ({ entry, diagnoses }) => {
  return (
    <Box border={1} borderRadius={2} p={1} mb={1}>
      <Typography variant="subtitle1">
        {entry.date} <LocalHospital fontSize="small" />
      </Typography>
      <Typography variant="body2" component="em">
        {entry.description}
      </Typography>
      <DiagnosisList codes={entry.diagnosisCodes} diagnoses={diagnoses} />
      <Typography variant="body2">
        discharge: {entry.discharge.date} – {entry.discharge.criteria}
      </Typography>
      <Typography variant="body2">diagnosed by {entry.specialist}</Typography>
    </Box>
  );
};

const OccupationalHealthcareEntryView: React.FC<{
  entry: OccupationalHealthcareEntry;
  diagnoses: Diagnosis[];
}> = ({ entry, diagnoses }) => {
  return (
    <Box border={1} borderRadius={2} p={1} mb={1}>
      <Typography variant="subtitle1">
        {entry.date} <Work fontSize="small" /> {entry.employerName}
      </Typography>
      <Typography variant="body2" component="em">
        {entry.description}
      </Typography>
      <DiagnosisList codes={entry.diagnosisCodes} diagnoses={diagnoses} />
      {entry.sickLeave && (
        <Typography variant="body2">
          sick leave: {entry.sickLeave.startDate} – {entry.sickLeave.endDate}
        </Typography>
      )}
      <Typography variant="body2">diagnosed by {entry.specialist}</Typography>
    </Box>
  );
};

const EntryDetails: React.FC<EntryDetailsProps> = ({ entry, diagnoses }) => {
  switch (entry.type) {
    case "HealthCheck":
      return <HealthCheckEntryView entry={entry} diagnoses={diagnoses} />;
    case "Hospital":
      return <HospitalEntryView entry={entry} diagnoses={diagnoses} />;
    case "OccupationalHealthcare":
      return (
        <OccupationalHealthcareEntryView
          entry={entry}
          diagnoses={diagnoses}
        />
      );
    default:
      return assertNever(entry);
  }
};

export default EntryDetails;