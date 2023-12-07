import { type } from "../../util/io.js";

export default async function joke(){
	await type(["Why cant you eat soup in the matrix"], {lineWait: 500});
	await type(["....."], {lineWait: 500});
	await type(["cuz there is no spoon"], {lineWait: 500});
}