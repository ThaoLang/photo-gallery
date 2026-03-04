"use client";

import { useState, useEffect} from "react";
import {
  Upload,
  Button,
  Card,
  Input,
  message,
  Typography,
  Space,
  Empty,
  Spin,
  Badge,
  Avatar,
  Divider,
  Modal,
} from "antd";
import {
  SendOutlined,
  CommentOutlined,
  ClockCircleOutlined,
  CloudUploadOutlined,
  InstagramFilled,
} from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import Image from "next/image";

const { Title, Text } = Typography;
const { TextArea } = Input;
const MAX_IMAGE_SIZE=4 * 1024 * 1024;

interface Comment {
  id: number;
  text: string;
  photoId: number;
  createdAt: string;
}

interface Photo {
  id: number;
  filename: string;
  url: string;
  createdAt: string;
  comments: Comment[];
}

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<number, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await fetch("/api/photos");
        const data = await res.json();
        setPhotos(Array.isArray(data) ? data : []);
      } catch {
        message.error("Failed to load photos");
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []); 

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning("Please select a photo first!");
      return;
    }

    const file = fileList[0].originFileObj as File;

    if (file.size > MAX_IMAGE_SIZE) {
      message.error("File is too large! Please select an image under 4MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await fetch("/api/photos", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Upload failed");
      }

      const newPhoto = await res.json();
      setPhotos((prev) => [newPhoto, ...prev]);
      setFileList([]);
      setIsModalOpen(false);
      message.success("Photo uploaded successfully!");
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleAddComment = async (photoId: number) => {
    const text = commentInputs[photoId]?.trim();
    if (!text) return;

    setSubmittingComment((prev) => ({ ...prev, [photoId]: true }));
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, text }),
      });

      if (!res.ok) throw new Error("Failed to add comment");

      const newComment = await res.json();
      setPhotos((prev) =>
        prev.map((photo) =>
          photo.id === photoId
            ? { ...photo, comments: [...photo.comments, newComment] }
            : photo
        )
      );
      setCommentInputs((prev) => ({ ...prev, [photoId]: "" }));
      message.success("Comment added!");
    } catch {
      message.error("Failed to add comment");
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [photoId]: false }));
    }
  };

  const uploadProps: UploadProps = {
    beforeUpload: () => false,
    fileList,
    onChange: ({ fileList: newFileList }) => setFileList(newFileList.slice(-1)),
    accept: "image/*",
    listType: "picture",
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "#fff",
        borderBottom: "1px solid #f0f0f0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        padding: "20px 24px",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <Title level={2} style={{ margin: 0 }}>
            <InstagramFilled style={{ marginRight: 8, color: "#1677ff" }} />
            Photo Gallery
          </Title>
          <Text type="secondary">Upload photos and share your thoughts</Text>
          <br />
          <Button
            type="primary"
            icon={<CloudUploadOutlined />}
            onClick={() => setIsModalOpen(true)}
            size="large"
            style={{ marginTop: 12 }}
          >
            Upload Photo
          </Button>
        </div>
      </div>

      <Modal
        title={null}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setFileList([]);
        }}
        footer={null}
        centered
        width={480}
      >
        <div style={{ textAlign: "center", padding: "8px 0 20px" }}>
          <Title level={4} style={{ marginBottom: 4 }}>Upload a Photo</Title>
          <Text type="secondary">PNG, JPG, JPEG, WEBP or GIF up to 4MB</Text>
        </div>

        <Upload.Dragger
          {...uploadProps}
          style={{ marginBottom: 16, borderRadius: 12 }}
        >
          <div style={{ padding: "24px 0" }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#eff2ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <CloudUploadOutlined style={{ fontSize: 28, color: "#1677ff" }} />
            </div>
            <Text strong style={{ fontSize: 16, display: "block", marginBottom: 4 }}>
              Drag & Drop
            </Text>
            <Text type="secondary">or click to select a file</Text>
          </div>
        </Upload.Dragger>

        <Button
          type="primary"
          block
          size="large"
          icon={<CloudUploadOutlined />}
          loading={uploading}
          disabled={fileList.length === 0}
          onClick={handleUpload}
          style={{ borderRadius: 8, height: 48, fontSize: 16 , marginTop: 16}}
        >
          {uploading ? "Uploading..." : "Upload Photo"}
        </Button>
      </Modal>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 64 }}>
            <Spin size="large" />
          </div>
        ) : photos.length === 0 ? (
          <Empty
            description="No photos yet. Upload one above!"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ marginTop: 64 }}
          />
        ) : (
          <Space orientation="vertical" size="large" style={{ width: "100%" }}>
            {photos.map((photo) => (
              <Card
                key={photo.id}
                style={{ borderRadius: 12, overflow: "hidden" }}
                styles={{ body: { padding: 0 } }}
              >
                <div style={{ position: "relative", width: "100%", maxHeight: 480 }}>
                  <Image
                    src={photo.url}
                    alt={photo.filename}
                    width={900}
                    height={480}
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: 480,
                      objectFit: "contain",
                      background: "#000",
                      display: "block",
                    }}
                    unoptimized
                  />
                </div>

                <div style={{ padding: "16px 20px" }}>
                  <Space style={{ marginBottom: 12 }}>
                    <ClockCircleOutlined style={{ color: "#8c8c8c" }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatDate(photo.createdAt)}
                    </Text>
                    <Badge
                      count={photo.comments.length}
                      showZero
                      color="#1677ff"
                      style={{ fontSize: 11 }}
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {photo.comments.length === 1 ? "comment" : "comments"}
                    </Text>
                  </Space>

                  {photo.comments.length > 0 && (
                    <>
                      <Divider
                        titlePlacement="start"
                        style={{ fontSize: 13, color: "#595959", margin: "8px 0 12px" }}
                      >
                        <CommentOutlined style={{ marginRight: 6 }} />
                        Comments
                      </Divider>
                      <Space orientation="vertical" style={{ width: "100%" }} size={8}>
                        {photo.comments.map((comment) => (
                          <div
                            key={comment.id}
                            style={{
                              display: "flex",
                              gap: 10,
                              padding: "8px 12px",
                              background: "#fafafa",
                              borderRadius: 8,
                              border: "1px solid #f0f0f0",
                            }}
                          >
                            <Avatar size={28} style={{ background: "#1677ff", flexShrink: 0 }}>
                              LTT
                            </Avatar>
                            <div style={{ flex: 1 }}>
                              <Text style={{ fontSize: 14 }}>{comment.text}</Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: 11 }}>
                                {formatDate(comment.createdAt)}
                              </Text>
                            </div>
                          </div>
                        ))}
                      </Space>
                    </>
                  )}

                  <Divider style={{ margin: "12px 0" }} />
                  <Space.Compact style={{ width: "100%" }}>
                    <TextArea
                      placeholder="Write a comment..."
                      value={commentInputs[photo.id] ?? ""}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [photo.id]: e.target.value,
                        }))
                      }
                      onPressEnter={(e) => {
                        if (!e.shiftKey) {
                          e.preventDefault();
                          handleAddComment(photo.id);
                        }
                      }}
                      autoSize={{ minRows: 1, maxRows: 3 }}
                      style={{ borderRadius: "6px 0 0 6px" }}
                    />
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      loading={submittingComment[photo.id]}
                      onClick={() => handleAddComment(photo.id)}
                      disabled={!commentInputs[photo.id]?.trim()}
                      style={{ height: "auto" }}
                    >
                      Post
                    </Button>
                  </Space.Compact>
                </div>
              </Card>
            ))}
          </Space>
        )}
      </div>
    </div>
  );
}