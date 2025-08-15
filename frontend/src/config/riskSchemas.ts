export type NumberField = {
  key: string;
  label: string;
  type: "number";
  placeholder?: string;
};

export type SelectOption = string | { label: string; value: string };

export type SelectField = {
  key: string;
  label: string;
  type: "select";
  options: SelectOption[];
};

export type CheckboxField = {
  key: string;
  label: string;
  type: "checkbox";
};

export type Field = NumberField | SelectField | CheckboxField;

export type RiskSchema = {
  endpoint: string;
  fields: Field[];
  title: string;
};

//HEART (UCI heart.csv style)
export const HEART_FAILURE_SCHEMA: RiskSchema = {
  title: "Heart Disease",
  endpoint: "/api/risk/heart-failure",
  fields: [
    { key: "Age", label: "Age (years)", type: "number" },
    {
      key: "Sex",
      label: "Biological Sex",
      type: "select",
      options: [
        { label: "Male", value: "M" },
        { label: "Female", value: "F" },
      ],
    },
    {
      key: "ChestPainType",
      label: "Chest Pain Presentation",
      type: "select",
      options: [
        { label: "Typical Angina (TA)", value: "TA" },
        { label: "Atypical Angina (ATA)", value: "ATA" },
        { label: "Non-Anginal Pain (NAP)", value: "NAP" },
        { label: "Asymptomatic (ASY)", value: "ASY" },
      ],
    },
    { key: "RestingBP", label: "Resting Blood Pressure (mmHg)", type: "number" },
    { key: "Cholesterol", label: "Serum Cholesterol (mg/dL)", type: "number" },
    { key: "FastingBS", label: "Fasting Blood Glucose (0 = <126 mg/dL, 1 = ≥126 mg/dL)", type: "number" },
    {
      key: "RestingECG",
      label: "Resting ECG Interpretation",
      type: "select",
      options: [
        { label: "Normal", value: "Normal" },
        { label: "ST–T Wave Abnormality (ST)", value: "ST" },
        { label: "Left Ventricular Hypertrophy (LVH)", value: "LVH" },
      ],
    },
    { key: "MaxHR", label: "Maximum Heart Rate Achieved", type: "number" },
    {
      key: "ExerciseAngina",
      label: "Exercise-Induced Angina",
      type: "select",
      options: [
        { label: "No", value: "N" },
        { label: "Yes", value: "Y" },
      ],
    },
    { key: "Oldpeak", label: "ST Depression (Oldpeak)", type: "number" },
    {
      key: "ST_Slope",
      label: "ST Segment Slope",
      type: "select",
      options: [
        { label: "Upsloping", value: "Up" },
        { label: "Flat", value: "Flat" },
        { label: "Downsloping", value: "Down" },
      ],
    },
  ],
};

//DIABETES (BRFSS diabetes_binary)
export const DIABETES_SCHEMA: RiskSchema = {
  title: "Diabetes",
  endpoint: "/api/risk/diabetes",
  fields: [
    { key: "HighBP", label: "History of Hypertension (0 = No, 1 = Yes)", type: "number" },
    { key: "HighChol", label: "History of High Cholesterol (0 = No, 1 = Yes)", type: "number" },
    { key: "CholCheck", label: "Cholesterol Checked in Past 5 Years (0/1)", type: "number" },
    { key: "BMI", label: "Body Mass Index (BMI)", type: "number" },
    { key: "Smoker", label: "Current Smoker (0 = No, 1 = Yes)", type: "number" },
    { key: "Stroke", label: "History of Stroke (0 = No, 1 = Yes)", type: "number" },
    { key: "HeartDiseaseorAttack", label: "History of CHD or MI (0/1)", type: "number" },
    { key: "PhysActivity", label: "Any Physical Activity in Past 30 Days (0/1)", type: "number" },
    { key: "Fruits", label: "Fruit Intake ≥ 1 Serving/Day (0/1)", type: "number" },
    { key: "Veggies", label: "Vegetable Intake ≥ 1 Serving/Day (0/1)", type: "number" },
    { key: "HvyAlcoholConsump", label: "Heavy Alcohol Consumption (0/1)", type: "number" },
    { key: "AnyHealthcare", label: "Any Health Care Coverage (0/1)", type: "number" },
    { key: "NoDocbcCost", label: "Could Not See Doctor Due to Cost (0/1)", type: "number" },
    { key: "GenHlth", label: "Self-Rated General Health (1 = Excellent … 5 = Poor)", type: "number" },
    { key: "MentHlth", label: "Days Mental Health Was Not Good (0–30)", type: "number" },
    { key: "PhysHlth", label: "Days Physical Health Was Not Good (0–30)", type: "number" },
    { key: "DiffWalk", label: "Difficulty Walking or Climbing Stairs (0/1)", type: "number" },
    { key: "Sex", label: "Biological Sex (0 = Female, 1 = Male)", type: "number" },
    { key: "Age", label: "Age Category (1–13)", type: "number" },
    { key: "Education", label: "Education Level (1–6)", type: "number" },
    { key: "Income", label: "Household Income Level (1–8)", type: "number" },
  ],
};

//STROKE (Kaggle stroke)
export const STROKE_SCHEMA: RiskSchema = {
  title: "Stroke",
  endpoint: "/api/risk/stroke",
  fields: [
    { key: "gender", label: "Biological Sex (0 = Female, 1 = Male)", type: "number" },
    { key: "age", label: "Age (years)", type: "number" },
    { key: "hypertension", label: "Hypertension (0 = No, 1 = Yes)", type: "number" },
    { key: "heart_disease", label: "Heart Disease (0 = No, 1 = Yes)", type: "number" },
    { key: "ever_married", label: "Ever Married (0 = No, 1 = Yes)", type: "number" },
    { key: "work_type", label: "Work Type (0 = Private … 4 = Children)", type: "number" },
    { key: "Residence_type", label: "Residence Type (0 = Rural, 1 = Urban)", type: "number" },
    { key: "avg_glucose_level", label: "Average Glucose Level (mg/dL)", type: "number" },
    { key: "bmi", label: "Body Mass Index (BMI)", type: "number" },
    { key: "smoking_status", label: "Smoking Status (0 = Never, 1 = Former, 2 = Smokes)", type: "number" },
  ],
};
