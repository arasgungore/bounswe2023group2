import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Divider, Avatar, Chip } from "@nextui-org/react";
import { BiDislike, BiSolidDislike, BiSolidLike } from "react-icons/bi";
import { BiLike } from "react-icons/bi";
import Status from "./StatusBar";
import Link from "next/link";
import { api } from "@/lib/apiUtils";
export default function ActivityModal({ isOpen, onOpen, onOpenChange, activity, activityType }) {
  const [like, setLike] = React.useState(false);
  const [dislike, setDislike] = React.useState(false);
  const handleLike = async (e) => {
    try {
      if((e.voteType === 'like' && e.vote === true) || (e.voteType === 'dislike' && e.vote === false)){

      const result = await fetch(`/api/vote/downvote`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        }, body: JSON.stringify({ entityID: activity._id, entityType: activityType })
      })
      const data = await result.json()
      console.log(data)
    }

    if((e.voteType === 'like' && e.vote === false) || (e.voteType === 'dislike' && e.vote === true)){ 
        const result = await fetch(`/api/vote/upvote`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          }, body: JSON.stringify({ entityID: activity._id, entityType: activityType  })
        })
        const data = await result.json()
    }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} className='text-black'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 ">{activity.type}</ModalHeader>
              <Divider />
              <ModalBody>

                {Object.keys(activity).map((key) => {
                  if (key === "_id"  || key === "initialQuantity" || key === "currentQuantity" || key === "createdBy" || key === "condition" || key === 'created_by' || key === 'details' ) <></>
                  else
                    return <p>
                      {key}: {(activity[key]) ?? "No information"}
                    </p>
                })}
                {Object.keys(activity.details).map((key) => {
                  if (key === "_id" || key === "description" || key === "initialQuantity" || key === "currentQuantity" || key === "createdBy" || key === "condition" || key === 'created_by' || key === 'details' ) <></>
                  else
                    return <p>
                      {key}: {(activity[key]) ?? "No information"}
                    </p>
                })}
                <span className=" flex flex-row gap-1 items-center ">
                  {['new', 'used'].map((condition) => {
                    if (condition === activity.condition)
                      return <Chip size='lg' color="warning" >{condition}</Chip>
                    else
                      return <Chip color="default" >{condition}</Chip>
                  })
                  }
                </span>
                <Status value={(activity.initialQuantity - activity.currentQuantity) * 100 / activity.initialQuantity} initial={activity.initialQuantity} current={activity.currentQuantity} />
                <p className='m-2 bg-sky-100 rounded p-2'>
                  {activity.description ?? "No description"}
                </p>
                <Divider />
                <div className='flex flex-row justify-between items-center'>
                  <div className='flex flex-row gap-1 items-center'>
                  <span className=" flex flex-row gap-1 items-center ">

                    <Avatar
                      onClick={(e) => { setLike(!like); setDislike(false); handleLike({ voteType: 'like', vote: like }) }}
                      radius="full" className=" hover:bg-gray-300"
                      icon={!like ? <BiLike className='w-8 h-8' /> : <BiSolidLike className='w-8 h-8' color="green" />}
                      classNames={{
                        base: "color-white bg-white",
                        icon: "",
                      }}
                    />
                    {activity?.downvote ?? 0}
                  </span>
                  <span className=" flex flex-row gap-1 items-center " >
                    <Avatar
                      onClick={(e) => { setLike(false); setDislike(!dislike); handleLike({ voteType: 'dislike', vote: dislike }) }}
                      radius="full" className=" hover:bg-gray-300"
                      icon={!dislike ? <BiDislike className='w-8 h-8' /> : <BiSolidDislike className='w-8 h-8' color="red" />}
                      classNames={{
                        base: "color-white bg-white",
                        icon: "",
                      }}
                    />
                    {activity?.upvote ?? 0}
                  </span>
                  </div>
                    <Link href={`/profile/${activity.created_by}`}>
                  <Chip
                    color="warning"
                    size="lg"
                    avatar={
                      <Avatar name={activity.created_by} size="lg" getInitials={(name) => name.charAt(0)} />
                    }
                  >
                    {activity.created_by}
                  </Chip>
                  </Link>
                </div>

              </ModalBody>


            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
