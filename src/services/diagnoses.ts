import axios from "axios";
import { Diagnosis } from "../types";
import { apiBaseUrl } from "../constants"; 

const baseUrl = `${apiBaseUrl}/diagnoses`;

const getAllDiagnoses = async () => {
  const { data } = await axios.get<Diagnosis[]>(
    `${baseUrl}`
  );

  return data;
};

export default {
  getAllDiagnoses
};