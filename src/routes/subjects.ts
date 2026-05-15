import express from "express";
import {and, desc, eq, getTableColumns, ilike, or} from "drizzle-orm";
import {sql} from "drizzle-orm";
import {departments, subjects} from "../db/schema";
import {db} from "../db/index";

const router = express.Router();

//Get all subjects with optional search,filtering and pagination
router.get('/', async (req, res) => {
    try {
        const {search,department,page=1,limit=10} = req.query;

        const currentPage = Math.max(1,+page);
        const limitPerPage=Math.max(1,+limit);

        const offset=(currentPage-1)*limitPerPage;

        const filterConditions=[];

        //if search query exist,filter by subject name or subject code
        if(search){
            filterConditions.push(
                or(
                    ilike(subjects.name,`%${search}%`),
                    ilike(subjects.code,`%${search}%`),
                )
            );
        }

        //if department filter exist, match department name
        if(department){
            filterConditions.push(ilike(departments.name,`%${department}%`));
        }

        //Combine all filters using AND if any exist
        const whereClause= filterConditions.length>0 ? and(...filterConditions) : undefined;

        const countResult=await db.select({count:sql<number>`count(*)`})
            .from(subjects)
            .leftJoin(departments,eq(subjects.departmentId,departments.id))
            .where(whereClause);

        const totalCount=countResult[0]?.count??0;

        const subjectsList=await db
            .select({
                ...getTableColumns(subjects),
                department:{...getTableColumns(departments),
            }}).from(subjects).leftJoin(departments,eq(subjects.departmentId,departments.id))
            .where(whereClause)
            .orderBy(desc(subjects.createdAt))
            .limit(limitPerPage)
            .offset(offset);

        res.status(200).json({
            data:subjectsList,
            pagination:{page:currentPage,limit:limitPerPage,total:totalCount,totalPage:Math.ceil(totalCount/limitPerPage)},
        });

    }catch (error) {
        console.error('Get /subkects error', error);
        res.status(500).json({error: 'Failed to get subjects'});
    }
})

export default router;