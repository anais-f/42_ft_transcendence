# game structure:

## Network management:

    there have 2 type of packet based on the same logic system
    Packet sent by the client to the server have prefix C<ID>
    Packet sent by the server to the client have prefix S<ID>
    Each packet implement <C-S>Base packet who own:
        - a timestamp
        - a serialize method
    Server or client can send one packet for each derived from '<C-S>Base' per tick
    Packet aren't sent by game loop directly, we use a packet sender

### Packet sender:

    Packet sender are an async loop who recived packets to send in a deque
    The sender loop on his deque and call serialize function for each packet
    Then he send it to the target

### NetworkManager:

    This part handle the packet received who is also async
    Network manager read conection and wait for BYTEMAP received
    Whene a BYTEMAP is handled by the NetworkManager:
        - the BYTEMAP is sent to the PacketDispatcher

### PacketDispatcher:

    The PacketDispatcher is a listener that waits for BYTEMAPs received
    when a BYTEMAP is recived it is deserialize using the deserializer

### Client to server Packets:

    - C00Base:
        - timestamp
    - C01Move:
        - uint8:
            - 0/1 start / stop
            - 0/1up / down
            - empty
            - empty
            - empty
            - empty
            - empty
            - empty

    [ ts ][ type      ][ data ]
    [    ][ 0000 0001 ][ 0o   ] 00
    [    ][ 0000 0011 ][ 10o  ] 01

### Server to client Packets

    - S00Base:
        - timestamp
    - S01ServerTickConfirmation:
        - noting
    - S02SegmentUpdate
    - S03BallUpdate
        - S04BallVelo
            - velo (vec2)
            - factor (number)
        - S05BallPos
            - pos (vec2)
        - s06BallState
            - pos (vec2)
            - velo (vec2)
            - factor (number)
        - S07Score
            - p1 score (uint8)
            - p2 score (uint8)
        - S07Countdown
            - remaining (uint8)

    [ ts ][ type       ][ data ]
    [    ][  0000 0001 ][ 0o   ] 00
    [    ][  0000 0011 ][ 1o   ] 01
    [    ][  0000 0101 ][ 1o   ] 03
    [    ][  0000 1101 ][ 33o  ] 04
    [    ][  0001 0101 ][ 25o  ] 05
    [    ][  0001 1101 ][ 49o  ] 06
    [    ][  0000 0111 ][ 11o  ] 07
    [    ][  0000 1001 ][ 10o  ] 08
