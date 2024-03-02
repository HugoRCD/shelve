import { PrismaClient } from "@prisma/client";
import { Role } from "~/types/User";

const prisma = new PrismaClient();

export default prisma;
