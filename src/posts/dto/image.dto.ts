import { IsObject, IsOptional, IsUUID } from "class-validator";
import { Column, Entity, PrimaryColumn } from "typeorm";

export type ImageMediaMetaData = {
    asset_id?: string;
    public_id?: string;
    version?: number;
    version_id?: string;
    width?: number;
    height?: number;
    format?: string;
    resource_type?: string;
    created_at?: string;
    tags?: string[];
    bytes?: number;
    type?: string;
    etag?: string;
    placeholder?: boolean;
    url?: string;
    secure_url?: string;
    folder?: string;
    original_filename?: string;
};

@Entity("image")
export class ImageDTO {
    @PrimaryColumn()
    @IsUUID()
    uploadId:string

    @Column({
        default:""
    })
    @IsOptional()
    imageUrl : string = ""

    @Column({
        name: "media_meta_data",
        type: "jsonb",
        nullable: true,
    })
    @IsOptional()
    @IsObject()
    mediaMetaData?: ImageMediaMetaData;
}
