import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Patient,
  Diagnosis,
  EntryWithoutId,
  HealthCheckRating,
} from "../../types";
import patientService from "../../services/patients";
import {
  Typography,
  TextField,
  Button,
  Box,
  Select,
  MenuItem,
} from "@mui/material";
import { Male, Female, Transgender } from "@mui/icons-material";
import EntryDetails from "../EntryDetails";
import axios from "axios";

interface PatientDetailsPageProps {
  diagnoses: Diagnosis[];
}

const genderIcon = (gender: Patient["gender"]) => {
  switch (gender) {
    case "male":
      return <Male />;
    case "female":
      return <Female />;
    case "other":
      return <Transgender />;
    default:
      return null;
  }
};

const PatientDetailsPage = ({ diagnoses }: PatientDetailsPageProps) => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [specialist, setSpecialist] = useState("");
  const [healthCheckRating, setHealthCheckRating] = useState<HealthCheckRating>(
    HealthCheckRating.Healthy
  );

  const [selectedDiagnosisCodes, setSelectedDiagnosisCodes] = useState<
    Array<Diagnosis["code"]>
  >([]);

  const [entryError, setEntryError] = useState<string | null>(null);

  type NewEntryType = "HealthCheck" | "Hospital" | "OccupationalHealthcare";

  const [entryType, setEntryType] = useState<NewEntryType>("HealthCheck");

  const [dischargeDate, setDischargeDate] = useState("");
  const [dischargeCriteria, setDischargeCriteria] = useState("");

  const [employerName, setEmployerName] = useState("");
  const [sickLeaveStart, setSickLeaveStart] = useState("");
  const [sickLeaveEnd, setSickLeaveEnd] = useState("");

  useEffect(() => {
    if (!id) return;
    void patientService
      .getById(id)
      .then((data) => {
        setPatient(data);
      })
      .catch((e) => {
        console.error(e);
        setError("Failed to fetch patient");
      });
  }, [id]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!patient) {
    return <div>Loading...</div>;
  }

  const handleAddEntry = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    if (!patient) return;

    setEntryError(null);

    const diagnosisCodes =
      selectedDiagnosisCodes.length > 0 ? selectedDiagnosisCodes : undefined;

    let newEntry: EntryWithoutId;

    switch (entryType) {
      case "HealthCheck":
        newEntry = {
          type: "HealthCheck",
          description,
          date,
          specialist,
          diagnosisCodes,
          healthCheckRating,
        };
        break;

      case "Hospital":
        newEntry = {
          type: "Hospital",
          description,
          date,
          specialist,
          diagnosisCodes,
          discharge: {
            date: dischargeDate,
            criteria: dischargeCriteria,
          },
        };
        break;

      case "OccupationalHealthcare":
        newEntry = {
          type: "OccupationalHealthcare",
          description,
          date,
          specialist,
          diagnosisCodes,
          employerName,
          ...(sickLeaveStart && sickLeaveEnd
            ? {
                sickLeave: { startDate: sickLeaveStart, endDate: sickLeaveEnd },
              }
            : {}),
        };
        break;

      default: {
        // exhaustive check
        const _exhaustive: never = entryType;
        throw new Error(`Unhandled entry type: ${_exhaustive}`);
      }
    }

    try {
      const added = await patientService.addEntry(patient.id, newEntry);
      setPatient({
        ...patient,
        entries: patient.entries.concat(added),
      });

      // reset form
      setDescription("");
      setDate("");
      setSpecialist("");
      setHealthCheckRating(HealthCheckRating.Healthy);
      setSelectedDiagnosisCodes([]);
      setDischargeDate("");
      setDischargeCriteria("");
      setEmployerName("");
      setSickLeaveStart("");
      setSickLeaveEnd("");
      setEntryError(null);
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        if (typeof e.response?.data === "string") {
          setEntryError(e.response.data);
        } else if (
          e.response?.data &&
          typeof e.response.data.error === "string"
        ) {
          setEntryError(e.response.data.error);
        } else {
          setEntryError(e.message);
        }
      } else {
        setEntryError("Unknown error while adding entry");
      }
    }
  };

  return (
    <div>
      <Typography variant="h4" component="h1" gutterBottom>
        {patient.name} {genderIcon(patient.gender)}
      </Typography>

      <Typography>ssn: {patient.ssn}</Typography>
      <Typography>occupation: {patient.occupation}</Typography>
      <Typography>date of birth: {patient.dateOfBirth}</Typography>

      {entryError && (
        <Box
          sx={{
            backgroundColor: "#fdecea",
            border: "1px solid #f5c2c0",
            color: "#b71c1c",
            padding: 1,
            marginBottom: 2,
          }}
        >
          {entryError}
        </Box>
      )}

      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{ marginTop: "1rem" }}
      >
        New entry
      </Typography>

      <Box
        component="form"
        onSubmit={handleAddEntry}
        sx={{ border: "1px dashed grey", padding: 2, marginBottom: 3 }}
      >
        {/* entry type selector */}
        <Box sx={{ marginBottom: 1 }}>
          <Select
            fullWidth
            value={entryType}
            onChange={(e) => setEntryType(e.target.value as NewEntryType)}
          >
            <MenuItem value="HealthCheck">HealthCheck</MenuItem>
            <MenuItem value="Hospital">Hospital</MenuItem>
            <MenuItem value="OccupationalHealthcare">
              Occupational healthcare
            </MenuItem>
          </Select>
        </Box>

        {/* common fields */}
        <TextField
          fullWidth
          label="Description"
          margin="dense"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField
          fullWidth
          label="Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          margin="dense"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <TextField
          fullWidth
          label="Specialist"
          margin="dense"
          value={specialist}
          onChange={(e) => setSpecialist(e.target.value)}
        />

        <Box sx={{ marginTop: 1, marginBottom: 1 }}>
          <Typography variant="subtitle2">Diagnosis codes</Typography>
          <Select
            fullWidth
            multiple
            value={selectedDiagnosisCodes}
            onChange={(event) => {
              const value = event.target.value;
              setSelectedDiagnosisCodes(
                typeof value === "string"
                  ? (value.split(",").map((v) => v.trim()) as Array<
                      Diagnosis["code"]
                    >)
                  : (value as Array<Diagnosis["code"]>)
              );
            }}
            renderValue={(selected) => (selected as string[]).join(", ")}
          >
            {diagnoses.map((d) => (
              <MenuItem key={d.code} value={d.code}>
                {d.code} {d.name}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* HealthCheck-specific */}
        {entryType === "HealthCheck" && (
          <Box sx={{ marginTop: 1 }}>
            <Typography variant="subtitle2">
              HealthCheck rating (0–3)
            </Typography>
            <Select
              fullWidth
              value={healthCheckRating}
              onChange={(event) =>
                setHealthCheckRating(
                  Number(event.target.value) as HealthCheckRating
                )
              }
            >
              <MenuItem value={HealthCheckRating.Healthy}>0 Healthy</MenuItem>
              <MenuItem value={HealthCheckRating.LowRisk}>1 Low risk</MenuItem>
              <MenuItem value={HealthCheckRating.HighRisk}>2 High risk</MenuItem>
              <MenuItem value={HealthCheckRating.CriticalRisk}>3 Critical risk</MenuItem>
            </Select>
          </Box>
        )}

        {/* Hospital-specific */}
        {entryType === "Hospital" && (
          <>
            <TextField
              fullWidth
              label="Discharge date"
              type="date"
              InputLabelProps={{ shrink: true }}
              margin="dense"
              value={dischargeDate}
              onChange={(e) => setDischargeDate(e.target.value)}
            />
            <TextField
              fullWidth
              label="Discharge criteria"
              margin="dense"
              value={dischargeCriteria}
              onChange={(e) => setDischargeCriteria(e.target.value)}
            />
          </>
        )}

        {/* OccupationalHealthcare-specific */}
        {entryType === "OccupationalHealthcare" && (
          <>
            <TextField
              fullWidth
              label="Employer name"
              margin="dense"
              value={employerName}
              onChange={(e) => setEmployerName(e.target.value)}
            />
            <TextField
              fullWidth
              label="Sick leave start date"
              type="date"
              InputLabelProps={{ shrink: true }}
              margin="dense"
              value={sickLeaveStart}
              onChange={(e) => setSickLeaveStart(e.target.value)}
            />
            <TextField
              fullWidth
              label="Sick leave end date"
              type="date"
              InputLabelProps={{ shrink: true }}
              margin="dense"
              value={sickLeaveEnd}
              onChange={(e) => setSickLeaveEnd(e.target.value)}
            />
          </>
        )}

        <Box sx={{ display: "flex", gap: 1, marginTop: 2 }}>
          <Button variant="contained" type="submit">
            Add
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setDescription("");
              setDate("");
              setSpecialist("");
              setHealthCheckRating(HealthCheckRating.Healthy);
              setSelectedDiagnosisCodes([]);
              setDischargeDate("");
              setDischargeCriteria("");
              setEmployerName("");
              setSickLeaveStart("");
              setSickLeaveEnd("");
              setEntryError(null);
            }}
          >
            Cancel
          </Button>
        </Box>
      </Box>
      
      {/* Entries*/}
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        style={{ marginTop: "1rem" }}
      >
        Entries
      </Typography>

      {patient.entries.length === 0 ? (
        <Typography>No entries yet.</Typography>
      ) : (
        <div>
          {patient.entries.map((entry) => (
            <EntryDetails key={entry.id} entry={entry} diagnoses={diagnoses} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientDetailsPage;
