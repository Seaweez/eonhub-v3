import React from "react";
import { Card, CardHeader, CardBody } from "@nextui-org/react";
import Image from 'next/image'

export  function ServerModal() {
    return (
        <Card className="py-4  border-2 border-black w-fit h-fit">
            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                <p className="text-tiny uppercase font-bold">Daily Mix</p>
                <small className="text-default-500">12 Tracks</small>
                <h4 className="font-bold text-large">Frontend Radio</h4>
            </CardHeader>
            <CardBody className="overflow-visible py-2">
                <Image
                    alt="Card background"
                    className="object-cover rounded-xl"
                    src="/images/games/02.png"
                    height={120}
                    width={270}
                />
            </CardBody>
        </Card>
    );
}


export default function CharacterCard() {
    return (
        <Card className="py-4  border-2 border-black w-fit h-fit">
            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                <p className="text-tiny uppercase font-bold">Daily Mix</p>
                <small className="text-default-500">12 Tracks</small>
                <h4 className="font-bold text-large">Frontend Radio</h4>
            </CardHeader>
            <CardBody className="overflow-visible py-2">
                <Image
                    alt="Card background"
                    className="object-cover rounded-xl"
                    src="/images/games/02.png"
                    height={120}
                    width={270}
                />
            </CardBody>
        </Card>
    );
}
