# game structure:

## Network management:

    there have 2 type of packet based on the same logic system
    Packet sent by the client to the server have prefix C<ID>
    Packet sent by the server to the client have prefix S<ID>
    Each packet implement <C-S>Base packet who own:
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
        - (empty base interface)
    - C01Move (2 bytes total):
        - byte 0: type (uint8)
        - byte 1: data (uint8)
            - bit 1: start/stop (0=stop, 1=start)
            - bit 0: up/down (0=down, 1=up)

    [ type      ][ data ]
    [ 0000 0001 ][   0o ] C00 (1 byte)
    [ 0000 0011 ][  10o ] C01 (2 bytes)

### Server to client Packets

    - S00Base:
        - (empty base interface)
    - S01ServerTickConfirmation (1 byte):
        - byte 0: type
    - S02SegmentUpdate (2 + 32n bytes):
        - byte 0: type
        - byte 1: segment count (uint8, max 255)
        - bytes 2+: segments (32 bytes each: 4x float64 for x1,y1,x2,y2)
    - S03BallUpdate (1 byte):
        - byte 0: type
    - S04BallVelo (25 bytes):
        - byte 0: type
        - bytes 1-8: velo.x (float64)
        - bytes 9-16: velo.y (float64)
        - bytes 17-24: factor (float64)
    - S05BallPos (17 bytes):
        - byte 0: type
        - bytes 1-8: pos.x (float64)
        - bytes 9-16: pos.y (float64)
    - S06BallSync (41 bytes):
        - byte 0: type
        - bytes 1-8: velo.x (float64)
        - bytes 9-16: velo.y (float64)
        - bytes 17-24: factor (float64)
        - bytes 25-32: pos.x (float64)
        - bytes 33-40: pos.y (float64)
    - S07Score (3 bytes):
        - byte 0: type
        - byte 1: p1 score (uint8)
        - byte 2: p2 score (uint8)
    - S08Countdown (2 bytes):
        - byte 0: type
        - byte 1: remaining seconds (uint8)
    - S09DynamicSegments (2 + 32n bytes):
        - byte 0: type
        - byte 1: segment count (uint8, max 255)
        - bytes 2+: segments (32 bytes each: 4x float64 for x1,y1,x2,y2)

    [ type       ][ data ]
    [ 0000 0001  ][   0o ] S00 (1 byte)
    [ 0000 0011  ][   0o ] S01 (1 byte)
    [ 0010 0001  ][ 1+32n] S02 (2 + 32n bytes) - static segments (sent once)
    [ 0000 0101  ][   0o ] S03 (1 byte)
    [ 0000 1101  ][  24o ] S04 (25 bytes)
    [ 0001 0101  ][  16o ] S05 (17 bytes)
    [ 0001 1101  ][  40o ] S06 (41 bytes)
    [ 0000 0111  ][   2o ] S07 (3 bytes)
    [ 0000 1001  ][   1o ] S08 (2 bytes)
    [ 0000 1011  ][ 1+32n] S09 (2 + 32n bytes) - dynamic segments (sent each tick)
