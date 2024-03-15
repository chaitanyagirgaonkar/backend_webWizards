import { Report } from "../models/report.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import mongoose, { isValidObjectId } from "mongoose"
import { uploadOnCloudinary, deleteOnCloudinary, uploadCoverImageOnCloudinary } from '../utils/cloudinary.js'



const isUserOwner = async (reportId, req) => {
    const report = await Report.findById(reportId);

    if (report?.owner?.toString() !== req.user?._id.toString()) {
        return false;
    }

    return true;

}

const createReport = asyncHandler(async function (req, res) {
    const { title, description, reportType } = req.body

    if (!title) {
        return res.json( new ApiError(400, "title is required"))
    }
    if (!description) {
        return res.json( new ApiError(401, "description is required"))
    }
    if (!reportType) {
        return res.json(new ApiError( 402, "report Type is required"))
    }


    const pdfFileLocalPath = req?.file?.path

    if (!pdfFileLocalPath) {
        return res.json( new ApiError(409, "pdf file is required"))
    }


    const pdfFile = await uploadOnCloudinary(pdfFileLocalPath)


    if (!pdfFile) {
        return res.json( new ApiError(406, "failed to upload pdf on cloudinary"))
    }



    const report = await Report.create({
        title,
        description,
        reportType,
        owner: req?.user?._id,
        pdfFile: {
            public_id: pdfFile?.public_id,
            url: pdfFile?.url,
        }
    })

    if (!report) {
        return res.json( new ApiError(408, "failed to create report"))
    }

    return res
        .status(200)
        .json(new ApiResponse(200, report, "report created successfully"))
});

const updateReport = asyncHandler(async function (req, res) {
    const { reportId } = req.params
    const { title, description, reportType } = req.body

    if (!isValidObjectId(reportId)) {
       return res.json( new ApiError(404, "In valid report Id !"))
    }
    if (!title) {
       return res.json( new ApiError(400, "title is required"))
    }
    if (!description) {
       return res.json( new ApiError(401, "description is required"))
    }
    if (!reportType) {
       return res.json( new ApiError(402, "report Type is required"))
    }

    const pdfFileLocalPath = req?.file?.path

    const authorized = await isUserOwner(reportId, req)

    if (!authorized) {
       return res.json( new ApiError(400, "Unauthorized Access"))
    }

    const previousReport = await Report.findOne(
        {
            _id: reportId
        }
    )

    if (!previousReport) {
       return res.json( new ApiError(404, 'previous report not found'))
    }

    let pdfFile;
    if (pdfFileLocalPath) {
        await deleteOnCloudinary(previousReport?.pdfFile?.public_id)

        pdfFile = await uploadCoverImageOnCloudinary(pdfFileLocalPath)

        if (!pdfFile) {
           return res.json( new ApiError(404, "pdf File is not upload on cloudinary"))
        }
    }
    if (!pdfFileLocalPath) {
        const report = await Report.findByIdAndUpdate(reportId,
            {
                $set: {
                    title,
                    description,
                    reportType
                }
            }, { new: true })

        if (!report) {
           return res.json( new ApiError(400, "failed to update report"))
        }
        return res.status(200)
            .json(new ApiResponse(200, report, "report updated successfully."))
    } else {
        const report = await Report.findByIdAndUpdate(reportId,
            {
                $set: {
                    title,
                    description,
                    reportType,
                    pdfFile: {
                        public_id: pdfFile?.public_id,
                        url: pdfFile?.url
                    }
                }
            }, { new: true })
        if (!report) {
           return res.json( new ApiError(400, "failed to update report"))
        }
        return res.status(200)
            .json(new ApiResponse(200, report, "report updated successfully."))
    }
});

const deleteReport = asyncHandler(async function (req, res) {
    const { reportId } = req.params

    if (!isValidObjectId(reportId)) {
       return res.json( new ApiError(400, "Invalid report Id"))
    }

    const authorized = await isUserOwner(reportId, req)
    if (!authorized) {
       return res.json( new ApiError(404, "unAuthorize user"))
    }

    const previousReport = await Report.findOne({
        _id: reportId
    })

    if (!previousReport) {
       return res.json( new ApiError(401, "previous report not found"))
    }
    if (previousReport) {
        const pdfdelete = await deleteOnCloudinary(previousReport?.pdfFile?.public_id, "raw")

        if (!pdfdelete) {
           return res.json( new ApiError(402, "failed to delete  pdfFile"))
        }
        // console.log(pdfdelete)
    }

    const report = await Report.findByIdAndDelete(reportId)
    if (!report) {
       return res.json( new ApiError(405, "failed to delete pdf"))
    }

    return res
        .status(200)
        .json(new ApiResponse(200, report, "pdf file deleted successfully"))
});

const getUserReportById = asyncHandler(async function (req, res) {
    const { reportId } = req.params

    if (!isValidObjectId(reportId)) {
       return res.json( new ApiError(400, "Invalid report Id"))
    }



    const report = await Report.findById(reportId)

    const authorized = isUserOwner(reportId, req)
    if (!authorized) {
       return res.json( new ApiError(404, "unAuthorize user"))
    }
    if (!report) {
       return res.json( new ApiError(400, "failed to fetch pdf"))
    }

    return res
        .status(200)
        .json(new ApiResponse(200, report, "report fetched successfully"))
});

const getUserAllReport = asyncHandler(async function (req, res) {
    const report = await Report.find(
        {
            owner: req?.user?._id
        }
    )

    if (!report) {
       return res.json( new ApiError(404, "failed to find user report"))
    }

    return res
        .status(200)
        .json(new ApiResponse(200, report, "All report fetched successfully !"))

});



export { createReport, updateReport, deleteReport, getUserReportById, getUserAllReport }