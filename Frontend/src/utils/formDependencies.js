import React, { useEffect, useState, useMemo, useRef } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import axios from "axios";
import { Loader2 } from "lucide-react";

import FormLayout from "../Components/Forms/FormLayout";
import FormInput from "../Components/Forms/FormInput";
import FormSelect from "../Components/Forms/FormSelect";
import FormSection from "../Components/Forms/FormSection";
import useAutoFill from "../hooks/useAutoFill";
import { useAlert } from "../context/AlertContext";
import { commonSchemas, createSignatureSchema } from "./validationSchemas";
import { onValidationFail, formatDateForAPI } from "./formUtils";

import {
  InstructionBlock,
  DynamicTable,
  TableInput,
  AddButton,
} from "../Components/Forms/Shared";

export {
  React,
  useEffect,
  useState,
  useMemo,
  useRef,
  useForm,
  useFieldArray,
  useWatch,
  useNavigate,
  useParams,
  useLocation,
  yupResolver,
  Yup,
  axios,
  Loader2,
  FormLayout,
  FormInput,
  FormSelect,
  FormSection,
  useAutoFill,
  useAlert,
  commonSchemas,
  createSignatureSchema,
  onValidationFail,
  formatDateForAPI,
  InstructionBlock,
  DynamicTable,
  TableInput,
  AddButton,
};
