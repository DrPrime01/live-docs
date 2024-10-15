"use client";
import { ClientSideSuspense, RoomProvider } from "@liveblocks/react/suspense";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import React, { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import Loader from "./Loader";
import { Editor } from "./editor/Editor";
import ActiveCollaborators from "./ActiveCollaborators";
import { Input } from "./ui/input";
import Image from "next/image";
import { updateDocument } from "@/lib/actions/room.actions";
import ShareModal from "./ShareModal";

const CollaborativeRoom = ({
  roomId,
  roomMetadata,
  currentUserType,
  users,
}: CollaborativeRoomProps) => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(roomMetadata.title);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateTitleHandler = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      setLoading(true);

      try {
        if (title !== roomMetadata.title) {
          const updatedDocument = await updateDocument(roomId, title);
          if (updatedDocument) {
            setEditing(false);
          }
        }
      } catch (error) {
        console.log(`An error occured: ${error}`);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setEditing(false);
        updateDocument(roomId, title);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [title, roomId]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);
  return (
    <RoomProvider id={roomId}>
      <ClientSideSuspense fallback={<Loader />}>
        <div className="collaborative-room">
          <Header>
            <div
              ref={containerRef}
              className="flex w-fit items-center justify-center gap-2"
            >
              {editing && !loading ? (
                <Input
                  type="text"
                  value={title}
                  ref={inputRef}
                  placeholder="Enter title"
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={updateTitleHandler}
                  disabled={!editing}
                  className="document-title-input"
                />
              ) : (
                <>
                  <p className="document-title">{title}</p>
                </>
              )}

              {currentUserType === "editor" && !editing && (
                <Image
                  src="/assets/icons/edit.svg"
                  alt="edit"
                  width={24}
                  height={24}
                  className="cursor-pointer"
                  onClick={() => setEditing(true)}
                />
              )}
              {currentUserType !== "editor" && !editing && (
                <p className="view-only-tag">View only</p>
              )}
              {loading && <p className="text-sm text-gra-400">Saving...</p>}
            </div>
            <div className="flex flex-1 w-full justify-end gap-2 sm:gap-3">
              <ActiveCollaborators />
              <ShareModal
                roomId={roomId}
                collaborators={users}
                creatorId={roomMetadata.creatorId}
                currentUserType={currentUserType}
              />
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </Header>
          <Editor roomId={roomId} currentUserType={currentUserType} />
        </div>
      </ClientSideSuspense>
    </RoomProvider>
  );
};

export default CollaborativeRoom;
