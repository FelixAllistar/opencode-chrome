# Theme System Design Document

Comprehensive guide to OpenCode's color system and theme implementation.

---

## Extract Base Colors

Organize fundamental color variables by family from CSS files.

### Grey Family

- --grey-dark-1: #ffffff
- --grey-dark-2: #ffffff
- --grey-dark-3: #ffffff
- --grey-dark-4: #ffffff
- --grey-dark-5: #ffffff
- --grey-dark-6: #ffffff
- --grey-dark-7: #ffffff
- --grey-dark-8: #ffffff
- --grey-dark-9: #ffffff
- --grey-dark-10: #ffffff
- --grey-dark-11: #ffffff
- --grey-dark-12: #ffffff
- --grey-light-1: #ffffff
- --grey-dark-alpha-1: #ffffff
- --grey-dark-alpha-2: #ffffff
- --grey-dark-alpha-3: #ffffff
- --grey-dark-alpha-4: #ffffff
- --grey-dark-alpha-5: #ffffff
- --grey-dark-alpha-6: #ffffff
- --grey-dark-alpha-7: #ffffff
- --grey-dark-alpha-8: #ffffff
- --grey-dark-alpha-9: #ffffff
- --grey-dark-alpha-10: #ffffff
- --grey-dark-alpha-11: #ffffff
- --grey-dark-alpha-12: #ffffff
- --grey-light-2: #ffffff
- --grey-light-3: #ffffff
- --grey-light-4: #ffffff
- --grey-light-5: #ffffff
- --grey-light-6: #ffffff
- --grey-light-7: #ffffff
- --grey-light-8: #ffffff
- --grey-light-9: #ffffff
- --grey-light-10: #ffffff
- --grey-light-11: #ffffff
- --grey-light-12: #ffffff
- --grey-light-alpha-1: #ffffff
- --grey-light-alpha-2: #ffffff
- --grey-light-alpha-3: #ffffff
- --grey-light-alpha-4: #ffffff
- --grey-light-alpha-5: #ffffff
- --grey-light-alpha-6: #ffffff
- --grey-light-alpha-7: #ffffff
- --grey-light-alpha-8: #ffffff
- --grey-light-alpha-9: #ffffff
- --grey-light-alpha-10: #ffffff
- --grey-light-alpha-11: #ffffff
- --grey-light-alpha-12: #ffffff

### Smoke Family

- --smoke-dark-1: #131010
- --smoke-dark-2: #1b1818
- --smoke-dark-3: #252121
- --smoke-dark-4: #2d2828
- --smoke-dark-5: #343030
- --smoke-dark-6: #3e3939
- --smoke-dark-7: #4b4646
- --smoke-dark-8: #645f5f
- --smoke-dark-9: #716c6b
- --smoke-dark-10: #7f7979
- --smoke-dark-11: #b7b1b1
- --smoke-dark-12: #f1ecec
- --smoke-light-1: #fdfcfc
- --smoke-light-2: #f9f8f8
- --smoke-light-3: #f1f0f0
- --smoke-light-4: #e9e8e8
- --smoke-light-5: #e2e0e0
- --smoke-light-6: #dad9d9
- --smoke-light-7: #cfcecd
- --smoke-light-8: #bcbbbb
- --smoke-light-9: #8e8b8b
- --smoke-light-10: #848181
- --smoke-light-11: #656363
- --smoke-light-12: #211e1e
- --smoke-dark-alpha-1: #bb000003
- --smoke-dark-alpha-2: #f9b4b40b
- --smoke-dark-alpha-3: #f9caca16
- --smoke-dark-alpha-4: #ffd5d51e
- --smoke-dark-alpha-5: #fce2e226
- --smoke-dark-alpha-6: #fce2e231
- --smoke-dark-alpha-7: #fce8e83f
- --smoke-dark-alpha-8: #fff1f159
- --smoke-dark-alpha-9: #fff3f067
- --smoke-dark-alpha-10: #fff2f276
- --smoke-dark-alpha-11: #fff7f7b2
- --smoke-light-alpha-1: #55000003
- --smoke-dark-alpha-12: #fffafaf0
- --smoke-light-alpha-2: #25000007
- --smoke-light-alpha-3: #1100000f
- --smoke-light-alpha-4: #0c000017
- --smoke-light-alpha-5: #1100001f
- --smoke-light-alpha-6: #07000026
- --smoke-light-alpha-7: #0b060032
- --smoke-light-alpha-8: #04000044
- --smoke-light-alpha-9: #07000074
- --smoke-light-alpha-10: #0400009c
- --smoke-light-alpha-11: #0700007e
- --smoke-light-alpha-12: #020000df

### Yuzu Family

- --yuzu-dark-1: #11120c
- --yuzu-light-1: #fdfdfb
- --yuzu-light-2: #fbfceb
- --yuzu-light-3: #f8fac5
- --yuzu-light-4: #f2f4a5
- --yuzu-light-5: #e9eb9a
- --yuzu-light-6: #dcde8e
- --yuzu-light-7: #cccd7e
- --yuzu-light-8: #b6b768
- --yuzu-light-9: #dcde8d
- --yuzu-light-10: #d2d384
- --yuzu-light-11: #7c7c2c
- --yuzu-light-12: #3d3d23
- --yuzu-dark-2: #181810
- --yuzu-dark-3: #262614
- --yuzu-dark-4: #313115
- --yuzu-dark-5: #3d3d18
- --yuzu-dark-6: #4a4a21
- --yuzu-dark-7: #5a5b2c
- --yuzu-dark-8: #6f6f36
- --yuzu-dark-9: #fdffca
- --yuzu-dark-10: #f4f6c1
- --yuzu-dark-11: #dbdda0
- --yuzu-dark-12: #eff1bd
- --yuzu-dark-alpha-1: #11910002
- --yuzu-dark-alpha-2: #f1f10008
- --yuzu-dark-alpha-3: #fafa3317
- --yuzu-dark-alpha-4: #fbfb2f23
- --yuzu-dark-alpha-5: #fbfb3730
- --yuzu-dark-alpha-6: #fcfc533e
- --yuzu-dark-alpha-7: #fafd6750
- --yuzu-dark-alpha-8: #ffff6f65
- --yuzu-dark-alpha-9: #fdffca
- --yuzu-dark-alpha-10: #fcfec7f6
- --yuzu-dark-alpha-11: #fdffb8db
- --yuzu-dark-alpha-12: #fdffc8f0
- --yuzu-light-alpha-1: #80800004
- --yuzu-light-alpha-2: #ccd90014
- --yuzu-light-alpha-3: #e1ea003a
- --yuzu-light-alpha-4: #dbe0015a
- --yuzu-light-alpha-5: #c8cd0065
- --yuzu-light-alpha-6: #b1b50071
- --yuzu-light-alpha-7: #9b9d0081
- --yuzu-light-alpha-8: #84860097
- --yuzu-light-alpha-9: #b1b60072
- --yuzu-light-alpha-10: #a2a4017b
- --yuzu-light-alpha-11: #616100d3
- --yuzu-light-alpha-12: #1e1e00dc

### Cobalt Family

- --cobalt-dark-1: #091120
- --cobalt-dark-2: #0d172b
- --cobalt-dark-3: #0c2255
- --cobalt-dark-4: #0c2a74
- --cobalt-dark-5: #113489
- --cobalt-dark-6: #18409b
- --cobalt-dark-7: #204cb1
- --cobalt-dark-8: #2558d0
- --cobalt-dark-9: #034cff
- --cobalt-dark-10: #0038ee
- --cobalt-dark-11: #89b5ff
- --cobalt-dark-12: #cde2ff
- --cobalt-light-1: #fcfdff
- --cobalt-light-2: #f5faff
- --cobalt-light-3: #eaf2ff
- --cobalt-light-4: #daeaff
- --cobalt-light-5: #c8e0ff
- --cobalt-light-6: #b4d2ff
- --cobalt-light-7: #98bfff
- --cobalt-dark-alpha-1: #0011f211
- --cobalt-dark-alpha-2: #0048fe1c
- --cobalt-dark-alpha-3: #004dff49
- --cobalt-dark-alpha-4: #064dfd6b
- --cobalt-dark-alpha-5: #1157ff81
- --cobalt-dark-alpha-6: #1e62ff94
- --cobalt-dark-alpha-7: #2768feac
- --cobalt-dark-alpha-8: #2a6affcd
- --cobalt-dark-alpha-9: #034cff
- --cobalt-dark-alpha-10: #003bffed
- --cobalt-dark-alpha-11: #89b5ff
- --cobalt-dark-alpha-12: #cde2ff
- --cobalt-light-8: #73a4ff
- --cobalt-light-9: #034cff
- --cobalt-light-10: #0443de
- --cobalt-light-11: #1251ec
- --cobalt-light-12: #0f2b6c
- --cobalt-light-alpha-1: #0055ff03
- --cobalt-light-alpha-2: #0080ff0a
- --cobalt-light-alpha-3: #0062ff15
- --cobalt-light-alpha-4: #006fff25
- --cobalt-light-alpha-5: #0070ff37
- --cobalt-light-alpha-6: #0167ff4b
- --cobalt-light-alpha-7: #0061ff67
- --cobalt-light-alpha-8: #005aff8c
- --cobalt-light-alpha-9: #004afffc
- --cobalt-light-alpha-10: #0040ddfb
- --cobalt-light-alpha-11: #0044ebed
- --cobalt-light-alpha-12: #001e63f0

### Apple Family

- --apple-dark-1: #0c140b
- --apple-light-1: #fafefa
- --apple-light-2: #f4fcf3
- --apple-light-3: #e1fade
- --apple-light-4: #cef6c9
- --apple-light-5: #b9efb3
- --apple-light-6: #9fe598
- --apple-light-7: #7dd676
- --apple-light-8: #43c23b
- --apple-light-9: #12c905
- --apple-light-10: #00bd00
- --apple-light-11: #008600
- --apple-light-12: #184115
- --apple-dark-2: #121b11
- --apple-dark-3: #152d13
- --apple-dark-4: #123d0f
- --apple-dark-5: #174b14
- --apple-dark-6: #1d5b19
- --apple-dark-7: #226c1e
- --apple-dark-8: #267f20
- --apple-dark-9: #12c905
- --apple-dark-10: #17bb0d
- --apple-dark-11: #37db2e
- --apple-dark-12: #aff7a8
- --apple-dark-alpha-1: #00d10004
- --apple-dark-alpha-2: #29f9120b
- --apple-dark-alpha-3: #33ff221e
- --apple-dark-alpha-4: #17fb0730
- --apple-dark-alpha-5: #2afc1e3f
- --apple-dark-alpha-6: #37fd2b50
- --apple-dark-alpha-7: #3efe3362
- --apple-dark-alpha-8: #3fff3276
- --apple-dark-alpha-9: #12fe02c6
- --apple-dark-alpha-10: #19fe0cb7
- --apple-dark-alpha-11: #3dfe33d9
- --apple-dark-alpha-12: #b4feacf7
- --apple-light-alpha-1: #00cc0005
- --apple-light-alpha-2: #16c0000c
- --apple-light-alpha-3: #18d90021
- --apple-light-alpha-4: #18d50036
- --apple-light-alpha-5: #15ca004c
- --apple-light-alpha-6: #12bf0067
- --apple-light-alpha-7: #0db30089
- --apple-light-alpha-8: #0bb000c4
- --apple-light-alpha-9: #0dc800fa
- --apple-light-alpha-10: #00bd00
- --apple-light-alpha-11: #008600
- --apple-light-alpha-12: #033000ea

### Ember Family

- --ember-dark-1: #170f0d
- --ember-dark-2: #201412
- --ember-dark-3: #3c140d
- --ember-dark-4: #530e05
- --ember-dark-5: #631409
- --ember-dark-6: #742216
- --ember-dark-7: #8d3324
- --ember-dark-8: #b64330
- --ember-dark-9: #fc533a
- --ember-dark-10: #ee462d
- --ember-dark-11: #ff917b
- --ember-dark-12: #ffd1c8
- --ember-light-1: #fffcfb
- --ember-light-2: #fff6f3
- --ember-light-3: #ffe9e4
- --ember-light-4: #ffd7cc
- --ember-light-5: #ffc8ba
- --ember-light-6: #ffb7a6
- --ember-light-7: #ffa392
- --ember-light-8: #f68975
- --ember-light-9: #fc533a
- --ember-light-10: #ef442a
- --ember-light-11: #da3319
- --ember-light-12: #5c281f
- --ember-dark-alpha-1: #ec000007
- --ember-dark-alpha-2: #f23e2011
- --ember-dark-alpha-3: #fb22002f
- --ember-dark-alpha-4: #ff070047
- --ember-dark-alpha-5: #ff1a0058
- --ember-dark-alpha-6: #fd3a1d6b
- --ember-dark-alpha-7: #ff533685
- --ember-dark-alpha-8: #ff5a3eb1
- --ember-dark-alpha-9: #ff553bfc
- --ember-dark-alpha-10: #ff4a2fed
- --ember-dark-alpha-11: #ff917b
- --ember-dark-alpha-12: #ffd1c8
- --ember-light-alpha-1: #ff400004
- --ember-light-alpha-2: #ff40000c
- --ember-light-alpha-3: #ff30001b
- --ember-light-alpha-4: #ff370033
- --ember-light-alpha-5: #ff340045
- --ember-light-alpha-6: #ff310059
- --ember-light-alpha-7: #ff28006d
- --ember-light-alpha-8: #ef25008a
- --ember-light-alpha-9: #fb2200c5
- --ember-light-alpha-10: #ec1f00d5
- --ember-light-alpha-11: #d61d00e6
- --ember-light-alpha-12: #460a00e0

### Solaris Family

- --solaris-dark-1: #13110b
- --solaris-dark-2: #1b180f
- --solaris-dark-3: #2a2307
- --solaris-dark-4: #382b00
- --solaris-dark-5: #443500
- --solaris-dark-6: #514307
- --solaris-dark-7: #64551a
- --solaris-dark-8: #7f6c25
- --solaris-dark-9: #fcd53a
- --solaris-dark-10: #f2cb2a
- --solaris-dark-11: #fdd63c
- --solaris-dark-12: #faebb5
- --solaris-light-1: #fefdfa
- --solaris-light-2: #fffbea
- --solaris-light-3: #fff6be
- --solaris-light-4: #ffee9c
- --solaris-light-5: #ffe47c
- --solaris-light-6: #f2d775
- --solaris-light-7: #e0c76f
- --solaris-light-8: #cdb047
- --solaris-light-9: #ffdc17
- --solaris-light-10: #fad337
- --solaris-light-11: #917500
- --solaris-light-12: #433c22
- --solaris-dark-alpha-1: #bb110003
- --solaris-dark-alpha-2: #f9b4000b
- --solaris-dark-alpha-3: #febb001b
- --solaris-dark-alpha-4: #feaf002a
- --solaris-dark-alpha-5: #feb80037
- --solaris-dark-alpha-6: #feca0045
- --solaris-dark-alpha-7: #ffd42b59
- --solaris-dark-alpha-8: #ffd63d76
- --solaris-dark-alpha-9: #ffd83bfc
- --solaris-dark-alpha-10: #fed52bf2
- --solaris-dark-alpha-11: #ffd83cfd
- --solaris-dark-alpha-12: #fff0b9fa
- --solaris-light-alpha-1: #cc990005
- --solaris-light-alpha-2: #ffcf0015
- --solaris-light-alpha-3: #ffdc0041
- --solaris-light-alpha-4: #ffd40063
- --solaris-light-alpha-5: #ffcb0083
- --solaris-light-alpha-6: #e7b6008a
- --solaris-light-alpha-7: #c89c0090
- --solaris-light-alpha-8: #ba9200b8
- --solaris-light-alpha-9: #ffd900e8
- --solaris-light-alpha-10: #f9c700c8
- --solaris-light-alpha-11: #917500
- --solaris-light-alpha-12: #261e00dd

### Lilac Family

- --lilac-dark-1: #140f14
- --lilac-dark-2: #1d141d
- --lilac-dark-3: #2f1e31
- --lilac-dark-4: #3e2440
- --lilac-dark-5: #4a2c4c
- --lilac-dark-6: #573859
- --lilac-dark-7: #6c486e
- --lilac-dark-8: #8a5e8d
- --lilac-dark-9: #edb2f1
- --lilac-dark-10: #e2a8e6
- --lilac-dark-11: #dca2e0
- --lilac-dark-12: #edd8ef
- --lilac-light-1: #fffcff
- --lilac-light-2: #fdf7fe
- --lilac-light-3: #fceafd
- --lilac-light-4: #faddfb
- --lilac-light-5: #f5cff7
- --lilac-light-6: #eebff1
- --lilac-light-7: #e3a9e7
- --lilac-light-8: #d78bdd
- --lilac-light-9: #a753ae
- --lilac-light-10: #9946a0
- --lilac-light-11: #95429c
- --lilac-light-12: #590b60
- --lilac-dark-alpha-1: #d100d104
- --lilac-dark-alpha-2: #fd4cfd0d
- --lilac-dark-alpha-3: #ec70fb23
- --lilac-dark-alpha-4: #f270fc33
- --lilac-dark-alpha-5: #f57dfd40
- --lilac-dark-alpha-6: #f691fd4e
- --lilac-dark-alpha-7: #fa9eff64
- --lilac-dark-alpha-8: #f9a5ff85
- --lilac-dark-alpha-9: #fbbcfff0
- --lilac-dark-alpha-10: #f9b9fee5
- --lilac-dark-alpha-11: #fab8ffde
- --lilac-dark-alpha-12: #fde6ffee
- --lilac-light-alpha-1: #ff00ff03
- --lilac-light-alpha-2: #c000e008
- --lilac-light-alpha-3: #db00e715
- --lilac-light-alpha-4: #da00e122
- --lilac-light-alpha-5: #ca00d530
- --lilac-light-alpha-6: #bc00c840
- --lilac-light-alpha-7: #ac00b856
- --lilac-light-alpha-8: #a800b574
- --lilac-light-alpha-9: #7d0087ac
- --lilac-light-alpha-10: #73007cb9
- --lilac-light-alpha-11: #70007abd
- --lilac-light-alpha-12: #520059f4

### Coral Family

- --coral-dark-1: #160f0e
- --coral-light-1: #fffcfc
- --coral-light-2: #fff8f7
- --coral-light-3: #ffebe8
- --coral-light-4: #ffdbd5
- --coral-light-5: #ffcdc5
- --coral-light-6: #f9beb5
- --coral-light-7: #e9aea6
- --coral-light-8: #d49b93
- --coral-light-9: #af7871
- --coral-light-10: #a26c65
- --coral-light-11: #9c665f
- --coral-light-12: #592a24
- --coral-dark-2: #1f1413
- --coral-dark-3: #391613
- --coral-dark-4: #481b17
- --coral-dark-5: #542621
- --coral-dark-6: #63332d
- --coral-dark-7: #77453f
- --coral-dark-8: #935e57
- --coral-dark-9: #ffd6d0
- --coral-dark-10: #f5ccc6
- --coral-dark-11: #e2a8a0
- --coral-dark-12: #fcd3cd
- --coral-dark-alpha-1: #e6000006
- --coral-dark-alpha-2: #ff44330f
- --coral-dark-alpha-3: #ff2f1d2b
- --coral-dark-alpha-4: #ff3d2b3b
- --coral-dark-alpha-5: #ff5c4a48
- --coral-dark-alpha-6: #ff746358
- --coral-dark-alpha-7: #fd897c6e
- --coral-dark-alpha-8: #fe9d908c
- --coral-dark-alpha-9: #ffd6d0
- --coral-dark-alpha-10: #fed3cdf5
- --coral-dark-alpha-11: #ffbdb4e0
- --coral-dark-alpha-12: #ffd6cffc
- --coral-light-alpha-1: #ff000003
- --coral-light-alpha-2: #ff200008
- --coral-light-alpha-3: #ff220017
- --coral-light-alpha-4: #ff25002a
- --coral-light-alpha-5: #ff24003a
- --coral-light-alpha-6: #eb20014a
- --coral-light-alpha-7: #c0170059
- --coral-light-alpha-8: #9a13006c
- --coral-light-alpha-9: #700d008e
- --coral-light-alpha-10: #650c009a
- --coral-light-alpha-11: #620b00a0
- --coral-light-alpha-12: #3e0700db

### Mint Family

- --mint-dark-alpha-1: #00bb0003
- --mint-dark-alpha-2: #2bf72b0a
- --mint-dark-alpha-3: #66fe5d1b
- --mint-dark-alpha-4: #63ff5d2c
- --mint-dark-alpha-5: #6cff643b
- --mint-dark-alpha-6: #71ff6a4b
- --mint-dark-alpha-7: #74fd6f5d
- --mint-dark-alpha-8: #74ff6f72
- --mint-dark-alpha-9: #c8ffc4f5
- --mint-dark-alpha-10: #c6fec2f5
- --mint-dark-alpha-11: #b4ffafdc
- --mint-dark-alpha-12: #c7ffc3fb
- --mint-dark-1: #0d130c
- --mint-dark-2: #121a12
- --mint-dark-3: #1a2a19
- --mint-dark-4: #1f3a1e
- --mint-dark-5: #264824
- --mint-dark-6: #2d572b
- --mint-dark-7: #356733
- --mint-dark-8: #3d7b3b
- --mint-dark-9: #c8ffc4
- --mint-dark-10: #bff5bb
- --mint-dark-11: #9dde99
- --mint-dark-12: #c4fbc0
- --mint-light-1: #fafefa
- --mint-light-2: #f4fcf3
- --mint-light-3: #dbfdd8
- --mint-light-4: #c3fabf
- --mint-light-5: #adf2a8
- --mint-light-6: #96e692
- --mint-light-7: #81d47d
- --mint-light-8: #6abc67
- --mint-light-9: #9ff29a
- --mint-light-10: #98e793
- --mint-light-11: #318430
- --mint-light-12: #1f461d
- --mint-dark-alpha-1: #00bb0003
- --mint-dark-alpha-2: #2bf72b09
- --mint-dark-alpha-3: #66fe5d1b
- --mint-dark-alpha-4: #63ff5d2b
- --mint-dark-alpha-5: #6cff643b
- --mint-dark-alpha-6: #71ff6a4a
- --mint-dark-alpha-7: #74fd6f5c
- --mint-dark-alpha-8: #74ff6f72
- --mint-dark-alpha-9: #c8ffc4f5
- --mint-dark-alpha-10: #c6fec2f5
- --mint-dark-alpha-11: #b4ffafdb
- --mint-dark-alpha-12: #c7ffc3fa
- --black: #000000
- --white: #ffffff
- --mint-light-alpha-1: #00cc0005
- --mint-light-alpha-2: #16c0000c
- --mint-light-alpha-3: #14f20027
- --mint-light-alpha-4: #10ec0040
- --mint-light-alpha-5: #0fd90057
- --mint-light-alpha-6: #0ac5006d
- --mint-light-alpha-7: #08ab0082
- --mint-light-alpha-8: #058f0098
- --mint-light-alpha-9: #0ddf0065
- --mint-light-alpha-10: #0cc7006c
- --mint-light-alpha-11: #016800cf
- --mint-light-alpha-12: #022e00e2
- --grey-light-alpha-1: #ffffff
- --grey-light-alpha-2: #ffffff
- --grey-light-alpha-3: #ffffff
- --grey-light-alpha-4: #ffffff
- --grey-light-alpha-5: #ffffff
- --grey-light-alpha-6: #ffffff
- --grey-light-alpha-7: #ffffff
- --grey-light-alpha-8: #ffffff
- --grey-light-alpha-9: #ffffff
- --grey-light-alpha-10: #ffffff
- --grey-light-alpha-11: #ffffff
- --grey-light-alpha-12: #ffffff

---

## Document Semantic Variables

List all semantic CSS variables and their mappings to base colors.

### Background Variables

- --background-base: #f8f7f7 (light), var(--smoke-dark-1) (dark)
- --background-weak: var(--smoke-light-3) (light), #201d1d (dark)
- --background-strong: var(--smoke-light-1) (light), #151313 (dark)
- --background-stronger: #fcfcfc (light), #201c1c (dark)
- --surface-base: var(--smoke-light-alpha-2) (light), var(--smoke-dark-alpha-3) (dark)
- --base: var(--smoke-light-alpha-2) (light), var(--smoke-dark-alpha-2) (dark)
- --base2: var(--smoke-light-alpha-2) (light), var(--smoke-dark-alpha-2) (dark)
- --base3: var(--smoke-light-alpha-2) (light), var(--smoke-dark-alpha-2) (dark)
- --surface-inset-base: var(--smoke-light-alpha-3) (light), #0e0b0b7f (dark)
- --surface-inset-base-hover: var(--smoke-light-alpha-3) (light), #0e0b0b7f (dark)
- --surface-inset-strong: #1f000017 (light), #060505cc (dark)
- --surface-inset-strong-hover: #1f000017 (light), #060505cc (dark)
- --surface-raised-base: var(--smoke-light-alpha-1) (light), var(--smoke-dark-alpha-3) (dark)
- --surface-float-base: var(--smoke-dark-1) (light), var(--smoke-dark-1) (dark)
- --surface-float-base-hover: var(--smoke-dark-2) (light), var(--smoke-dark-2) (dark)
- --surface-raised-base-hover: var(--smoke-light-alpha-2) (light), var(--smoke-dark-alpha-4) (dark)
- --surface-raised-strong: var(--smoke-light-1) (light), var(--smoke-dark-alpha-4) (dark)
- --surface-raised-strong-hover: var(--white) (light), var(--smoke-dark-alpha-6) (dark)
- --surface-raised-stronger: var(--white) (light), var(--smoke-dark-alpha-6) (dark)
- --surface-raised-stronger-hover: var(--white) (light), var(--smoke-dark-alpha-7) (dark)
- --surface-weak: var(--smoke-light-alpha-3) (light), var(--smoke-dark-alpha-5) (dark)
- --surface-weaker: var(--smoke-light-alpha-4) (light), var(--smoke-dark-alpha-6) (dark)
- --surface-strong: #ffffff (light), var(--smoke-dark-alpha-7) (dark)
- --surface-raised-stronger-non-alpha: var(--white) (light), var(--smoke-dark-4) (dark)
- --surface-brand-base: var(--yuzu-light-9) (light), var(--yuzu-light-9) (dark)
- --surface-brand-hover: var(--yuzu-light-10) (light), var(--yuzu-light-10) (dark)
- --surface-interactive-base: var(--cobalt-light-3) (light), var(--cobalt-light-3) (dark)
- --surface-interactive-hover: var(--cobalt-light-4) (light), var(--cobalt-light-4) (dark)
- --surface-interactive-weak: var(--cobalt-light-2) (light), var(--cobalt-light-2) (dark)
- --surface-interactive-weak-hover: var(--cobalt-light-3) (light), var(--cobalt-light-3) (dark)
- --surface-success-base: var(--apple-light-3) (light), var(--apple-light-3) (dark)
- --surface-success-weak: var(--apple-light-2) (light), var(--apple-light-2) (dark)
- --surface-success-strong: var(--apple-light-9) (light), var(--apple-light-9) (dark)
- --surface-warning-base: var(--solaris-light-3) (light), var(--solaris-light-3) (dark)
- --surface-warning-weak: var(--solaris-light-2) (light), var(--solaris-light-2) (dark)
- --surface-warning-strong: var(--solaris-light-9) (light), var(--solaris-light-9) (dark)
- --surface-critical-base: var(--ember-light-3) (light), var(--ember-light-3) (dark)
- --surface-critical-weak: var(--ember-light-2) (light), var(--ember-light-2) (dark)
- --surface-critical-strong: var(--ember-light-9) (light), var(--ember-light-9) (dark)
- --surface-info-base: var(--lilac-light-3) (light), var(--lilac-light-3) (dark)
- --surface-info-weak: var(--lilac-light-2) (light), var(--lilac-light-2) (dark)
- --surface-info-strong: var(--lilac-light-9) (light), var(--lilac-light-9) (dark)
- --surface-diff-hidden-base: var(--cobalt-light-3) (light), var(--cobalt-dark-2) (dark)
- --surface-diff-hidden-weak: var(--cobalt-light-2) (light), var(--cobalt-dark-1) (dark)
- --surface-diff-hidden-weaker: var(--cobalt-light-1) (light), var(--cobalt-dark-3) (dark)
- --surface-diff-hidden-strong: var(--cobalt-light-5) (light), var(--cobalt-dark-5) (dark)
- --surface-diff-hidden-stronger: var(--cobalt-light-9) (light), var(--cobalt-dark-11) (dark)
- --surface-diff-add-base: var(--mint-light-3) (light), var(--mint-dark-3) (dark)
- --surface-diff-add-weak: var(--mint-light-2) (light), var(--mint-dark-4) (dark)
- --surface-diff-add-weaker: var(--mint-light-1) (light), var(--mint-dark-3) (dark)
- --surface-diff-add-strong: var(--mint-light-5) (light), var(--mint-dark-5) (dark)
- --surface-diff-add-stronger: var(--mint-light-9) (light), var(--mint-dark-11) (dark)
- --surface-diff-delete-base: var(--ember-light-3) (light), var(--ember-dark-3) (dark)
- --surface-diff-delete-weak: var(--ember-light-2) (light), var(--ember-dark-4) (dark)
- --surface-diff-delete-weaker: var(--ember-light-1) (light), var(--ember-dark-3) (dark)
- --surface-diff-delete-strong: var(--ember-light-6) (light), var(--ember-dark-5) (dark)
- --surface-diff-delete-stronger: var(--ember-light-9) (light), var(--ember-dark-11) (dark)

### Text Variables

- --text-base: var(--smoke-light-11) (light), var(--smoke-dark-alpha-11) (dark)
- --input-base: var(--smoke-light-1) (light), var(--smoke-dark-2) (dark)
- --input-hover: var(--smoke-light-2) (light), var(--smoke-dark-2) (dark)
- --input-active: var(--cobalt-light-1) (light), var(--cobalt-dark-1) (dark)
- --input-selected: var(--cobalt-light-4) (light), var(--cobalt-dark-2) (dark)
- --input-focus: var(--cobalt-light-1) (light), var(--cobalt-dark-1) (dark)
- --input-disabled: var(--smoke-light-4) (light), var(--smoke-dark-4) (dark)
- --text-weak: var(--smoke-light-9) (light), var(--smoke-dark-alpha-9) (dark)
- --text-weaker: var(--smoke-light-8) (light), var(--smoke-dark-alpha-8) (dark)
- --text-strong: var(--smoke-light-12) (light), var(--smoke-dark-alpha-12) (dark)
- --text-on-brand-base: var(--smoke-light-alpha-11) (light), var(--smoke-dark-alpha-11) (dark)
- --text-on-interactive-base: var(--smoke-light-1) (light), var(--smoke-dark-12) (dark)
- --text-on-interactive-weak: var(--smoke-dark-alpha-11) (light), var(--smoke-dark-alpha-11) (dark)
- --text-on-success-base: var(--smoke-dark-alpha-11) (light), var(--smoke-dark-alpha-11) (dark)
- --text-on-warning-base: var(--smoke-dark-alpha-11) (light), var(--smoke-dark-alpha-11) (dark)
- --text-on-info-base: var(--smoke-dark-alpha-11) (light), var(--smoke-dark-alpha-11) (dark)
- --text-diff-add-base: var(--mint-light-11) (light), var(--mint-dark-11) (dark)
- --text-diff-delete-base: var(--ember-light-11) (light), var(--ember-dark-9) (dark)
- --text-diff-delete-strong: var(--ember-light-12) (light), var(--ember-dark-12) (dark)
- --text-diff-add-strong: var(--mint-light-12) (light), var(--mint-dark-8) (dark)
- --text-on-info-weak: var(--smoke-dark-alpha-9) (light), var(--smoke-dark-alpha-9) (dark)
- --text-on-info-strong: var(--smoke-dark-alpha-12) (light), var(--smoke-dark-alpha-12) (dark)
- --text-on-warning-weak: var(--smoke-dark-alpha-9) (light), var(--smoke-dark-alpha-9) (dark)
- --text-on-warning-strong: var(--smoke-dark-alpha-12) (light), var(--smoke-dark-alpha-12) (dark)
- --text-on-success-weak: var(--smoke-dark-alpha-9) (light), var(--smoke-dark-alpha-9) (dark)
- --text-on-success-strong: var(--smoke-dark-alpha-12) (light), var(--smoke-dark-alpha-12) (dark)
- --text-on-brand-weak: var(--smoke-light-alpha-9) (light), var(--smoke-dark-alpha-9) (dark)
- --text-on-brand-weaker: var(--smoke-light-alpha-8) (light), var(--smoke-dark-alpha-8) (dark)
- --text-on-brand-strong: var(--smoke-light-alpha-12) (light), var(--smoke-dark-alpha-12) (dark)

### Button Variables

- --button-secondary-base: #fdfcfc (light), var(--smoke-dark-6) (dark)
- --button-secondary-base-hover: var(--smoke-light-2) (light), var(--smoke-dark-5) (dark)

### Border Variables

- --border-base: var(--smoke-light-alpha-7) (light), var(--smoke-dark-alpha-7) (dark)
- --border-hover: var(--smoke-light-alpha-8) (light), var(--smoke-dark-alpha-8) (dark)
- --border-active: var(--smoke-light-alpha-9) (light), var(--smoke-dark-alpha-9) (dark)
- --border-selected: var(--cobalt-light-alpha-9) (light), var(--cobalt-dark-alpha-9) (dark)
- --border-disabled: var(--smoke-light-alpha-8) (light), var(--smoke-dark-alpha-8) (dark)
- --border-focus: var(--smoke-light-alpha-9) (light), var(--smoke-dark-alpha-9) (dark)
- --border-weak-base: var(--smoke-light-alpha-5) (light), var(--smoke-dark-alpha-6) (dark)
- --border-strong-base: var(--smoke-light-alpha-7) (light), var(--smoke-dark-alpha-8) (dark)
- --border-strong-hover: var(--smoke-light-alpha-8) (light), var(--smoke-dark-alpha-7) (dark)
- --border-strong-active: var(--smoke-light-alpha-7) (light), var(--smoke-dark-alpha-8) (dark)
- --border-strong-selected: var(--cobalt-light-alpha-6) (light), var(--cobalt-dark-alpha-6) (dark)
- --border-strong-disabled: var(--smoke-light-alpha-6) (light), var(--smoke-dark-alpha-6) (dark)
- --border-strong-focus: var(--smoke-light-alpha-7) (light), var(--smoke-dark-alpha-8) (dark)
- --border-weak-hover: var(--smoke-light-alpha-6) (light), var(--smoke-dark-alpha-7) (dark)
- --border-weak-active: var(--smoke-light-alpha-7) (light), var(--smoke-dark-alpha-8) (dark)
- --border-weak-selected: var(--cobalt-light-alpha-4) (light), var(--cobalt-dark-alpha-3) (dark)
- --border-weak-disabled: var(--smoke-light-alpha-6) (light), var(--smoke-dark-alpha-6) (dark)
- --border-weak-focus: var(--smoke-light-alpha-7) (light), var(--smoke-dark-alpha-8) (dark)
- --border-interactive-base: var(--cobalt-light-7) (light), var(--cobalt-light-7) (dark)
- --border-interactive-hover: var(--cobalt-light-8) (light), var(--cobalt-light-8) (dark)
- --border-interactive-active: var(--cobalt-light-9) (light), var(--cobalt-light-9) (dark)
- --border-interactive-selected: var(--cobalt-light-9) (light), var(--cobalt-light-9) (dark)
- --border-interactive-disabled: var(--smoke-light-8) (light), var(--smoke-light-8) (dark)
- --border-interactive-focus: var(--cobalt-light-9) (light), var(--cobalt-light-9) (dark)
- --border-success-base: var(--apple-light-6) (light), var(--apple-light-6) (dark)
- --border-success-hover: var(--apple-light-7) (light), var(--apple-light-7) (dark)
- --border-success-selected: var(--apple-light-9) (light), var(--apple-light-9) (dark)
- --border-warning-base: var(--solaris-light-6) (light), var(--solaris-light-6) (dark)
- --border-warning-hover: var(--solaris-light-7) (light), var(--solaris-light-7) (dark)
- --border-warning-selected: var(--solaris-light-9) (light), var(--solaris-light-9) (dark)
- --border-critical-base: var(--ember-light-6) (light), var(--ember-light-6) (dark)
- --border-critical-hover: var(--ember-light-7) (light), var(--ember-light-7) (dark)
- --border-critical-selected: var(--ember-light-9) (light), var(--ember-light-9) (dark)
- --border-info-base: var(--lilac-light-6) (light), var(--lilac-light-6) (dark)
- --border-info-hover: var(--lilac-light-7) (light), var(--lilac-light-7) (dark)
- --border-info-selected: var(--lilac-light-9) (light), var(--lilac-light-9) (dark)

### Icon Variables

- --icon-base: var(--smoke-light-9) (light), var(--smoke-dark-9) (dark)
- --icon-hover: var(--smoke-light-11) (light), var(--smoke-dark-10) (dark)
- --icon-active: var(--smoke-light-12) (light), var(--smoke-dark-11) (dark)
- --icon-selected: var(--smoke-light-12) (light), var(--smoke-dark-12) (dark)
- --icon-disabled: var(--smoke-light-8) (light), var(--smoke-dark-7) (dark)
- --icon-focus: var(--smoke-light-12) (light), var(--smoke-dark-12) (dark)
- --icon-weak-base: var(--smoke-light-7) (light), var(--smoke-dark-6) (dark)
- --icon-invert-base: #ffffff (light), var(--smoke-dark-1) (dark)
- --icon-weak-hover: var(--smoke-light-8) (light), var(--smoke-light-7) (dark)
- --icon-weak-active: var(--smoke-light-9) (light), var(--smoke-light-8) (dark)
- --icon-weak-selected: var(--smoke-light-10) (light), var(--smoke-light-9) (dark)
- --icon-weak-disabled: var(--smoke-light-6) (light), var(--smoke-light-4) (dark)
- --icon-weak-focus: var(--smoke-light-9) (light), var(--smoke-light-9) (dark)
- --icon-strong-base: var(--smoke-light-12) (light), var(--smoke-dark-12) (dark)
- --icon-strong-hover: var(--smoke-light-12) (light), var(--smoke-light-12) (dark)
- --icon-strong-active: var(--smoke-light-12) (light), var(--smoke-light-12) (dark)
- --icon-strong-selected: var(--smoke-light-12) (light), var(--smoke-light-12) (dark)
- --icon-strong-disabled: var(--smoke-light-8) (light), var(--smoke-light-8) (dark)
- --icon-strong-focus: var(--smoke-light-12) (light), var(--smoke-light-12) (dark)
- --icon-brand-base: var(--smoke-light-12) (light), var(--white) (dark)
- --icon-interactive-base: var(--cobalt-light-9) (light), var(--cobalt-dark-9) (dark)
- --icon-success-base: var(--apple-light-7) (light), var(--apple-dark-7) (dark)
- --icon-success-hover: var(--apple-light-8) (light), var(--apple-dark-8) (dark)
- --icon-success-active: var(--apple-light-11) (light), var(--apple-dark-11) (dark)
- --icon-warning-base: var(--solaris-light-7) (light), var(--solaris-dark-7) (dark)
- --icon-warning-hover: var(--solaris-light-8) (light), var(--solaris-dark-8) (dark)
- --icon-warning-active: var(--solaris-light-11) (light), var(--solaris-dark-11) (dark)
- --icon-critical-base: var(--ember-light-7) (light), var(--ember-dark-7) (dark)
- --icon-critical-hover: var(--ember-light-8) (light), var(--ember-dark-8) (dark)
- --icon-critical-active: var(--ember-light-11) (light), var(--ember-dark-11) (dark)
- --icon-info-base: var(--lilac-light-7) (light), var(--lilac-dark-7) (dark)
- --icon-info-hover: var(--lilac-light-8) (light), var(--lilac-dark-8) (dark)
- --icon-info-active: var(--lilac-light-11) (light), var(--lilac-dark-11) (dark)
- --icon-on-brand-base: var(--smoke-light-alpha-11) (light), var(--smoke-light-alpha-11) (dark)
- --icon-on-brand-hover: var(--smoke-light-alpha-12) (light), var(--smoke-light-alpha-12) (dark)
- --icon-on-brand-selected: var(--smoke-light-alpha-12) (light), var(--smoke-light-alpha-12) (dark)
- --icon-on-interactive-base: var(--smoke-light-1) (light), var(--smoke-dark-12) (dark)
- --icon-agent-plan-base: var(--lilac-light-9) (light), var(--lilac-dark-9) (dark)
- --icon-agent-docs-base: var(--solaris-light-9) (light), var(--solaris-dark-9) (dark)
- --icon-agent-ask-base: var(--cobalt-light-9) (light), var(--cobalt-dark-9) (dark)
- --icon-agent-build-base: var(--cobalt-light-9) (light), var(--cobalt-dark-9) (dark)
- --icon-on-success-base: var(--apple-light-alpha-9) (light), var(--apple-dark-alpha-9) (dark)
- --icon-on-success-hover: var(--apple-light-alpha-10) (light), var(--apple-dark-alpha-10) (dark)
- --icon-on-success-selected: var(--apple-light-alpha-11) (light), var(--apple-dark-alpha-11) (dark)
- --icon-on-warning-base: var(--solaris-light-alpha-9) (light), var(--solaris-dark-alpha-9) (dark)
- --icon-on-warning-hover: var(--solaris-light-alpha-10) (light), var(--solaris-dark-alpha-10) (dark)
- --icon-on-warning-selected: var(--solaris-light-alpha-11) (light), var(--solaris-dark-alpha-11) (dark)
- --icon-on-critical-base: var(--ember-light-alpha-9) (light), var(--ember-dark-alpha-9) (dark)
- --icon-on-critical-hover: var(--ember-light-alpha-10) (light), var(--ember-dark-alpha-10) (dark)
- --icon-on-critical-selected: var(--ember-light-alpha-11) (light), var(--ember-dark-alpha-11) (dark)
- --icon-on-info-base: var(--lilac-light-9) (light), var(--lilac-dark-9) (dark)
- --icon-on-info-hover: var(--lilac-light-alpha-10) (light), var(--lilac-dark-alpha-10) (dark)
- --icon-on-info-selected: var(--lilac-light-alpha-11) (light), var(--lilac-dark-alpha-11) (dark)
- --icon-diff-add-base: var(--mint-light-11) (light), var(--mint-dark-11) (dark)
- --icon-diff-add-hover: var(--mint-light-12) (light), var(--mint-dark-10) (dark)
- --icon-diff-add-active: var(--mint-light-12) (light), var(--mint-dark-11) (dark)
- --icon-diff-delete-base: var(--ember-light-9) (light), var(--ember-dark-9) (dark)
- --icon-diff-delete-hover: var(--ember-light-10) (light), var(--ember-dark-10) (dark)
- --icon-diff-delete-active: var(--ember-light-11) (light), var(--ember-dark-11) (dark)

### Syntax Variables

- --syntax-comment: #8a8a8a (light), #808080 (dark)
- --syntax-string: #d68c27 (light), #9d7cd8 (dark)
- --syntax-keyword: #3b7dd8 (light), #fab283 (dark)
- --syntax-function: #d1383d (light), #e06c75 (dark)
- --syntax-number: #3d9a57 (light), #7fd88f (dark)
- --syntax-operator: #d68c27 (light), #f5a742 (dark)
- --syntax-variable: #b0851f (light), #e5c07b (dark)
- --syntax-type: #318795 (light), #56b6c2 (dark)
- --syntax-constant: #953170 (light), #c2569a (dark)
- --syntax-punctuation: #1a1a1a (light), #eeeeee (dark)
- --syntax-success: var(--apple-dark-10) (light), var(--apple-dark-10) (dark)
- --syntax-warning: var(--solaris-light-10) (light), var(--solaris-dark-10) (dark)
- --syntax-critical: var(--ember-dark-9) (light), var(--ember-dark-10) (dark)
- --syntax-info: var(--lilac-dark-11) (light), var(--lilac-dark-10) (dark)

### Markdown Variables

- --markdown-heading: #d68c27 (light), #9d7cd8 (dark)
- --markdown-text: #1a1a1a (light), #eeeeee (dark)
- --markdown-link: #3b7dd8 (light), #fab283 (dark)
- --markdown-link-text: #318795 (light), #56b6c2 (dark)
- --markdown-code: #3d9a57 (light), #7fd88f (dark)
- --markdown-block-quote: #b0851f (light), #e5c07b (dark)
- --markdown-emph: #b0851f (light), #e5c07b (dark)
- --markdown-strong: #d68c27 (light), #f5a742 (dark)
- --markdown-horizontal-rule: #8a8a8a (light), #808080 (dark)
- --markdown-list-item: #3b7dd8 (light), #fab283 (dark)
- --markdown-list-enumeration: #318795 (light), #56b6c2 (dark)
- --markdown-image: #3b7dd8 (light), #fab283 (dark)
- --markdown-image-text: #318795 (light), #56b6c2 (dark)
- --markdown-code-block: #1a1a1a (light), #eeeeee (dark)

---

## Map Component Variables

Show which semantic variables are used by UI components.

### Background Components

- Buttons: --surface-brand-base, --surface-brand-hover, --surface-brand-active, --surface-brand-focus, --button-secondary-base, --surface-hover, --surface-active, --surface-focus, --surface-disabled
- Panels: --surface-base, --surface-raised-base, --surface-raised-stronger-non-alpha, --background-base, --background-stronger
- Inputs: --surface-base, --input-base

### Text Components

- Headings: --text-strong
- Body text: --text-base, --text-strong, --text-weak, --text-weaker
- Links: --text-base, --text-strong

### Border Components

- Inputs: --border-base, --border-focus, --border-active, --border-disabled
- Buttons: --border-base, --border-hover, --border-active, --border-focus, --border-disabled
- Panels: --border-base, --border-weak-base

### Icon Components

- Default icons: --icon-base
- Brand icons: --icon-brand-base, --icon-on-brand-base, --icon-on-brand-hover, --icon-on-brand-selected
- Status icons: --icon-success-base, --icon-success-hover, --icon-success-active, --icon-warning-base, --icon-warning-hover, --icon-warning-active, --icon-critical-base, --icon-critical-hover, --icon-critical-active, --icon-info-base, --icon-info-hover, --icon-info-active
- Interactive icons: --icon-strong-base, --icon-strong-hover, --icon-strong-active, --icon-strong-focus, --icon-strong-disabled, --icon-weak-base, --icon-weak-hover, --icon-weak-active, --icon-invert-base

---

## List Theme Definitions (24 themes)

Document all available themes with complete color definitions.

### Zenburn Theme

**Defs:**

- bg: #3f3f3f
- bgAlt: #4f4f4f
- bgPanel: #5f5f5f
- fg: #dcdccc
- fgMuted: #9f9f9f
- red: #cc9393
- redBright: #dca3a3
- green: #7f9f7f
- greenBright: #8fb28f
- yellow: #f0dfaf
- yellowDim: #e0cf9f
- blue: #8cd0d3
- blueDim: #7cb8bb
- magenta: #dc8cc3
- cyan: #93e0e3
- orange: #dfaf8f

**Theme Mappings:**

- primary: #8cd0d3 (dark), #5f7f8f (light)
- secondary: #dc8cc3 (dark), #8f5f8f (light)
- accent: #93e0e3 (dark), #5f8f8f (light)
- error: #cc9393 (dark), #8f5f5f (light)
- warning: #f0dfaf (dark), #8f8f5f (light)
- success: #7f9f7f (dark), #5f8f5f (light)
- info: #dfaf8f (dark), #8f7f5f (light)
- text: #dcdccc (dark), #3f3f3f (light)
- textMuted: #9f9f9f (dark), #6f6f6f (light)
- background: #3f3f3f (dark), #ffffef (light)
- backgroundPanel: #4f4f4f (dark), #f5f5e5 (light)
- backgroundElement: #5f5f5f (dark), #ebebdb (light)
- border: #5f5f5f (dark), #d0d0c0 (light)
- borderActive: #8cd0d3 (dark), #5f7f8f (light)
- borderSubtle: #4f4f4f (dark), #e0e0d0 (light)
- diffAdded: #7f9f7f (dark), #5f8f5f (light)
- diffRemoved: #cc9393 (dark), #8f5f5f (light)
- diffContext: #9f9f9f (dark), #6f6f6f (light)
- diffHunkHeader: #93e0e3 (dark), #5f8f8f (light)
- diffHighlightAdded: #8fb28f (dark), #5f8f5f (light)
- diffHighlightRemoved: #dca3a3 (dark), #8f5f5f (light)
- diffAddedBg: #4f5f4f (dark), #efffef (light)
- diffRemovedBg: #5f4f4f (dark), #ffefef (light)
- diffContextBg: #4f4f4f (dark), #f5f5e5 (light)
- diffLineNumber: #6f6f6f (dark), #b0b0a0 (light)
- diffAddedLineNumberBg: #4f5f4f (dark), #efffef (light)
- diffRemovedLineNumberBg: #5f4f4f (dark), #ffefef (light)
- markdownText: #dcdccc (dark), #3f3f3f (light)
- markdownHeading: #f0dfaf (dark), #8f8f5f (light)
- markdownLink: #8cd0d3 (dark), #5f7f8f (light)
- markdownLinkText: #93e0e3 (dark), #5f8f8f (light)
- markdownCode: #7f9f7f (dark), #5f8f5f (light)
- markdownBlockQuote: #9f9f9f (dark), #6f6f6f (light)
- markdownEmph: #e0cf9f (dark), #8f8f5f (light)
- markdownStrong: #dfaf8f (dark), #8f7f5f (light)
- markdownHorizontalRule: #9f9f9f (dark), #6f6f6f (light)
- markdownListItem: #8cd0d3 (dark), #5f7f8f (light)
- markdownListEnumeration: #93e0e3 (dark), #5f8f8f (light)
- markdownImage: #8cd0d3 (dark), #5f7f8f (light)
- markdownImageText: #93e0e3 (dark), #5f8f8f (light)
- markdownCodeBlock: #dcdccc (dark), #3f3f3f (light)
- syntaxComment: #7f9f7f (dark), #5f7f5f (light)
- syntaxKeyword: #f0dfaf (dark), #8f8f5f (light)
- syntaxFunction: #8cd0d3 (dark), #5f7f8f (light)
- syntaxVariable: #dcdccc (dark), #3f3f3f (light)
- syntaxString: #cc9393 (dark), #8f5f5f (light)
- syntaxNumber: #8fb28f (dark), #5f8f5f (light)
- syntaxType: #93e0e3 (dark), #5f8f8f (light)
- syntaxOperator: #f0dfaf (dark), #8f8f5f (light)
- syntaxPunctuation: #dcdccc (dark), #3f3f3f (light)

### Vesper Theme

**Defs:**

- vesperBg: #101010
- vesperFg: #FFF
- vesperComment: #8b8b8b94
- vesperKeyword: #A0A0A0
- vesperFunction: #FFC799
- vesperString: #99FFE4
- vesperNumber: #FFC799
- vesperError: #FF8080
- vesperWarning: #FFC799
- vesperSuccess: #99FFE4
- vesperMuted: #A0A0A0

**Theme Mappings:**

- primary: #FFC799 (dark), #FFC799 (light)
- secondary: #99FFE4 (dark), #99FFE4 (light)
- accent: #FFC799 (dark), #FFC799 (light)
- error: vesperError (dark), vesperError (light)
- warning: vesperWarning (dark), vesperWarning (light)
- success: vesperSuccess (dark), vesperSuccess (light)
- info: #FFC799 (dark), #FFC799 (light)
- text: vesperFg (dark), vesperBg (light)
- textMuted: vesperMuted (dark), vesperMuted (light)
- background: vesperBg (dark), #FFF (light)
- backgroundPanel: vesperBg (dark), #F0F0F0 (light)
- backgroundElement: vesperBg (dark), #E0E0E0 (light)
- border: #282828 (dark), #D0D0D0 (light)
- borderActive: #FFC799 (dark), #FFC799 (light)
- borderSubtle: #1C1C1C (dark), #E8E8E8 (light)
- diffAdded: vesperSuccess (dark), vesperSuccess (light)
- diffRemoved: vesperError (dark), vesperError (light)
- diffContext: vesperMuted (dark), vesperMuted (light)
- diffHunkHeader: vesperMuted (dark), vesperMuted (light)
- diffHighlightAdded: vesperSuccess (dark), vesperSuccess (light)
- diffHighlightRemoved: vesperError (dark), vesperError (light)
- diffAddedBg: #0d2818 (dark), #e8f5e8 (light)
- diffRemovedBg: #281a1a (dark), #f5e8e8 (light)
- diffContextBg: vesperBg (dark), #F8F8F8 (light)
- diffLineNumber: #505050 (dark), #808080 (light)
- diffAddedLineNumberBg: #0d2818 (dark), #e8f5e8 (light)
- diffRemovedLineNumberBg: #281a1a (dark), #f5e8e8 (light)
- markdownText: vesperFg (dark), vesperBg (light)
- markdownHeading: #FFC799 (dark), #FFC799 (light)
- markdownLink: #FFC799 (dark), #FFC799 (light)
- markdownLinkText: vesperMuted (dark), vesperMuted (light)
- markdownCode: vesperMuted (dark), vesperMuted (light)
- markdownBlockQuote: vesperFg (dark), vesperBg (light)
- markdownEmph: vesperFg (dark), vesperBg (light)
- markdownStrong: vesperFg (dark), vesperBg (light)
- markdownHorizontalRule: #65737E (dark), #65737E (light)
- markdownListItem: vesperFg (dark), vesperBg (light)
- markdownListEnumeration: vesperFg (dark), vesperBg (light)
- markdownImage: #FFC799 (dark), #FFC799 (light)
- markdownImageText: vesperMuted (dark), vesperMuted (light)
- markdownCodeBlock: vesperFg (dark), vesperBg (light)
- syntaxComment: vesperComment (dark), vesperComment (light)
- syntaxKeyword: vesperKeyword (dark), vesperKeyword (light)
- syntaxFunction: vesperFunction (dark), vesperFunction (light)
- syntaxVariable: vesperFg (dark), vesperBg (light)
- syntaxString: vesperString (dark), vesperString (light)
- syntaxNumber: vesperNumber (dark), vesperNumber (light)
- syntaxType: vesperFunction (dark), vesperFunction (light)
- syntaxOperator: vesperKeyword (dark), vesperKeyword (light)
- syntaxPunctuation: vesperFg (dark), vesperBg (light)

### Dracula Theme

**Defs:**

- background: #282a36
- currentLine: #44475a
- selection: #44475a
- foreground: #f8f8f2
- comment: #6272a4
- cyan: #8be9fd
- green: #50fa7b
- orange: #ffb86c
- pink: #ff79c6
- purple: #bd93f9
- red: #ff5555
- yellow: #f1fa8c

**Theme Mappings:**

- primary: purple (dark), purple (light)
- secondary: pink (dark), pink (light)
- accent: cyan (dark), cyan (light)
- error: red (dark), red (light)
- warning: yellow (dark), yellow (light)
- success: green (dark), green (light)
- info: orange (dark), orange (light)
- text: foreground (dark), #282a36 (light)
- textMuted: comment (dark), #6272a4 (light)
- background: #282a36 (dark), #f8f8f2 (light)
- backgroundPanel: #21222c (dark), #e8e8e2 (light)
- backgroundElement: currentLine (dark), #d8d8d2 (light)
- border: currentLine (dark), #c8c8c2 (light)
- borderActive: purple (dark), purple (light)
- borderSubtle: #191a21 (dark), #e0e0e0 (light)
- diffAdded: green (dark), green (light)
- diffRemoved: red (dark), red (light)
- diffContext: comment (dark), #6272a4 (light)
- diffHunkHeader: comment (dark), #6272a4 (light)
- diffHighlightAdded: green (dark), green (light)
- diffHighlightRemoved: red (dark), red (light)
- diffAddedBg: #1a3a1a (dark), #e0ffe0 (light)
- diffRemovedBg: #3a1a1a (dark), #ffe0e0 (light)
- diffContextBg: #21222c (dark), #e8e8e2 (light)
- diffLineNumber: currentLine (dark), #c8c8c2 (light)
- diffAddedLineNumberBg: #1a3a1a (dark), #e0ffe0 (light)
- diffRemovedLineNumberBg: #3a1a1a (dark), #ffe0e0 (light)
- markdownText: foreground (dark), #282a36 (light)
- markdownHeading: purple (dark), purple (light)
- markdownLink: cyan (dark), cyan (light)
- markdownLinkText: pink (dark), pink (light)
- markdownCode: green (dark), green (light)
- markdownBlockQuote: comment (dark), #6272a4 (light)
- markdownEmph: yellow (dark), yellow (light)
- markdownStrong: orange (dark), orange (light)
- markdownHorizontalRule: comment (dark), #6272a4 (light)
- markdownListItem: purple (dark), purple (light)
- markdownListEnumeration: cyan (dark), cyan (light)
- markdownImage: cyan (dark), cyan (light)
- markdownImageText: pink (dark), pink (light)
- markdownCodeBlock: foreground (dark), #282a36 (light)
- syntaxComment: comment (dark), #6272a4 (light)
- syntaxKeyword: pink (dark), pink (light)
- syntaxFunction: green (dark), green (light)
- syntaxVariable: foreground (dark), #282a36 (light)
- syntaxString: yellow (dark), yellow (light)
- syntaxNumber: purple (dark), purple (light)
- syntaxType: cyan (dark), cyan (light)
- syntaxOperator: pink (dark), pink (light)
- syntaxPunctuation: foreground (dark), #282a36 (light)

### Night Owl Theme

**Defs:**

- nightOwlBg: #011627
- nightOwlFg: #d6deeb
- nightOwlBlue: #82AAFF
- nightOwlCyan: #7fdbca
- nightOwlGreen: #c5e478
- nightOwlYellow: #ecc48d
- nightOwlOrange: #F78C6C
- nightOwlRed: #EF5350
- nightOwlPink: #ff5874
- nightOwlPurple: #c792ea
- nightOwlMuted: #5f7e97
- nightOwlGray: #637777
- nightOwlLightGray: #89a4bb
- nightOwlPanel: #0b253a

**Theme Mappings:**

- primary: nightOwlBlue (dark), nightOwlBlue (light)
- secondary: nightOwlCyan (dark), nightOwlCyan (light)
- accent: nightOwlPurple (dark), nightOwlPurple (light)
- error: nightOwlRed (dark), nightOwlRed (light)
- warning: nightOwlYellow (dark), nightOwlYellow (light)
- success: nightOwlGreen (dark), nightOwlGreen (light)
- info: nightOwlBlue (dark), nightOwlBlue (light)
- text: nightOwlFg (dark), nightOwlFg (light)
- textMuted: nightOwlMuted (dark), nightOwlMuted (light)
- background: nightOwlBg (dark), nightOwlBg (light)
- backgroundPanel: nightOwlPanel (dark), nightOwlPanel (light)
- backgroundElement: nightOwlPanel (dark), nightOwlPanel (light)
- border: nightOwlMuted (dark), nightOwlMuted (light)
- borderActive: nightOwlBlue (dark), nightOwlBlue (light)
- borderSubtle: nightOwlMuted (dark), nightOwlMuted (light)
- diffAdded: nightOwlGreen (dark), nightOwlGreen (light)
- diffRemoved: nightOwlRed (dark), nightOwlRed (light)
- diffContext: nightOwlMuted (dark), nightOwlMuted (light)
- diffHunkHeader: nightOwlMuted (dark), nightOwlMuted (light)
- diffHighlightAdded: nightOwlGreen (dark), nightOwlGreen (light)
- diffHighlightRemoved: nightOwlRed (dark), nightOwlRed (light)
- diffAddedBg: #0a2e1a (dark), #0a2e1a (light)
- diffRemovedBg: #2d1b1b (dark), #2d1b1b (light)
- diffContextBg: nightOwlPanel (dark), nightOwlPanel (light)
- diffLineNumber: nightOwlMuted (dark), nightOwlMuted (light)
- diffAddedLineNumberBg: #0a2e1a (dark), #0a2e1a (light)
- diffRemovedLineNumberBg: #2d1b1b (dark), #2d1b1b (light)
- markdownText: nightOwlFg (dark), nightOwlFg (light)
- markdownHeading: nightOwlBlue (dark), nightOwlBlue (light)
- markdownLink: nightOwlCyan (dark), nightOwlCyan (light)
- markdownLinkText: nightOwlBlue (dark), nightOwlBlue (light)
- markdownCode: nightOwlGreen (dark), nightOwlGreen (light)
- markdownBlockQuote: nightOwlMuted (dark), nightOwlMuted (light)
- markdownEmph: nightOwlPurple (dark), nightOwlPurple (light)
- markdownStrong: nightOwlYellow (dark), nightOwlYellow (light)
- markdownHorizontalRule: nightOwlMuted (dark), nightOwlMuted (light)
- markdownListItem: nightOwlBlue (dark), nightOwlBlue (light)
- markdownListEnumeration: nightOwlCyan (dark), nightOwlCyan (light)
- markdownImage: nightOwlCyan (dark), nightOwlCyan (light)
- markdownImageText: nightOwlBlue (dark), nightOwlBlue (light)
- markdownCodeBlock: nightOwlFg (dark), nightOwlFg (light)
- syntaxComment: nightOwlGray (dark), nightOwlGray (light)
- syntaxKeyword: nightOwlPurple (dark), nightOwlPurple (light)
- syntaxFunction: nightOwlBlue (dark), nightOwlBlue (light)
- syntaxVariable: nightOwlFg (dark), nightOwlFg (light)
- syntaxString: nightOwlYellow (dark), nightOwlYellow (light)
- syntaxNumber: nightOwlOrange (dark), nightOwlOrange (light)
- syntaxType: nightOwlGreen (dark), nightOwlGreen (light)
- syntaxOperator: nightOwlCyan (dark), nightOwlCyan (light)
- syntaxPunctuation: nightOwlFg (dark), nightOwlFg (light)

### Tokyo Night Theme

**Defs:**

- darkStep1: #1a1b26
- darkStep2: #1e2030
- darkStep3: #222436
- darkStep4: #292e42
- darkStep5: #3b4261
- darkStep6: #545c7e
- darkStep7: #737aa2
- darkStep8: #9099b2
- darkStep9: #82aaff
- darkStep10: #89b4fa
- darkStep11: #828bb8
- darkStep12: #c8d3f5
- darkRed: #ff757f
- darkOrange: #ff966c
- darkYellow: #ffc777
- darkGreen: #c3e88d
- darkCyan: #86e1fc
- darkPurple: #c099ff
- lightStep1: #e1e2e7
- lightStep2: #d5d6db
- lightStep3: #c8c9ce
- lightStep4: #b9bac1
- lightStep5: #a8aecb
- lightStep6: #9699a8
- lightStep7: #737a8c
- lightStep8: #5a607d
- lightStep9: #2e7de9
- lightStep10: #1a6ce7
- lightStep11: #8990a3
- lightStep12: #3760bf
- lightRed: #f52a65
- lightOrange: #b15c00
- lightYellow: #8c6c3e
- lightGreen: #587539
- lightCyan: #007197
- lightPurple: #9854f1

**Theme Mappings:**

- primary: darkStep9 (dark), lightStep9 (light)
- secondary: darkPurple (dark), lightPurple (light)
- accent: darkOrange (dark), lightOrange (light)
- error: darkRed (dark), lightRed (light)
- warning: darkOrange (dark), lightOrange (light)
- success: darkGreen (dark), lightGreen (light)
- info: darkStep9 (dark), lightStep9 (light)
- text: darkStep12 (dark), lightStep12 (light)
- textMuted: darkStep11 (dark), lightStep11 (light)
- background: darkStep1 (dark), lightStep1 (light)
- backgroundPanel: darkStep2 (dark), lightStep2 (light)
- backgroundElement: darkStep3 (dark), lightStep3 (light)
- border: darkStep7 (dark), lightStep7 (light)
- borderActive: darkStep8 (dark), lightStep8 (light)
- borderSubtle: darkStep6 (dark), lightStep6 (light)
- diffAdded: #4fd6be (dark), #1e725c (light)
- diffRemoved: #c53b53 (dark), #c53b53 (light)
- diffContext: #828bb8 (dark), #7086b5 (light)
- diffHunkHeader: #828bb8 (dark), #7086b5 (light)
- diffHighlightAdded: #b8db87 (dark), #4db380 (light)
- diffHighlightRemoved: #e26a75 (dark), #f52a65 (light)
- diffAddedBg: #20303b (dark), #d5e5d5 (light)
- diffRemovedBg: #37222c (dark), #f7d8db (light)
- diffContextBg: darkStep2 (dark), lightStep2 (light)
- diffLineNumber: darkStep3 (dark), lightStep3 (light)
- diffAddedLineNumberBg: #1b2b34 (dark), #c5d5c5 (light)
- diffRemovedLineNumberBg: #2d1f26 (dark), #e7c8cb (light)
- markdownText: darkStep12 (dark), lightStep12 (light)
- markdownHeading: darkPurple (dark), lightPurple (light)
- markdownLink: darkStep9 (dark), lightStep9 (light)
- markdownLinkText: darkCyan (dark), lightCyan (light)
- markdownCode: darkGreen (dark), lightGreen (light)
- markdownBlockQuote: darkYellow (dark), lightYellow (light)
- markdownEmph: darkYellow (dark), lightYellow (light)
- markdownStrong: darkOrange (dark), lightOrange (light)
- markdownHorizontalRule: darkStep11 (dark), lightStep11 (light)
- markdownListItem: darkStep9 (dark), lightStep9 (light)
- markdownListEnumeration: darkCyan (dark), lightCyan (light)
- markdownImage: darkStep9 (dark), lightStep9 (light)
- markdownImageText: darkCyan (dark), lightCyan (light)
- markdownCodeBlock: darkStep12 (dark), lightStep12 (light)
- syntaxComment: darkStep11 (dark), lightStep11 (light)
- syntaxKeyword: darkPurple (dark), lightPurple (light)
- syntaxFunction: darkStep9 (dark), lightStep9 (light)
- syntaxVariable: darkRed (dark), lightRed (light)
- syntaxString: darkGreen (dark), lightGreen (light)
- syntaxNumber: darkOrange (dark), lightOrange (light)
- syntaxType: darkYellow (dark), lightYellow (light)
- syntaxOperator: darkCyan (dark), lightCyan (light)
- syntaxPunctuation: darkStep12 (dark), lightStep12 (light)

### Synthwave84 Theme

**Defs:**

- background: #262335
- backgroundAlt: #1e1a29
- backgroundPanel: #2a2139
- foreground: #ffffff
- foregroundMuted: #848bbd
- pink: #ff7edb
- pinkBright: #ff92df
- cyan: #36f9f6
- cyanBright: #72f1f8
- yellow: #fede5d
- yellowBright: #fff95d
- orange: #ff8b39
- orangeBright: #ff9f43
- purple: #b084eb
- purpleBright: #c792ea
- red: #fe4450
- redBright: #ff5fb3
- green: #72f1b8
- greenBright: #97f1d8

**Theme Mappings:**

- primary: cyan (dark), #00bcd4 (light)
- secondary: pink (dark), #e91e63 (light)
- accent: purple (dark), #9c27b0 (light)
- error: red (dark), #f44336 (light)
- warning: yellow (dark), #ff9800 (light)
- success: green (dark), #4caf50 (light)
- info: orange (dark), #ff5722 (light)
- text: foreground (dark), #262335 (light)
- textMuted: foregroundMuted (dark), #5c5c8a (light)
- background: #262335 (dark), #fafafa (light)
- backgroundPanel: #1e1a29 (dark), #f5f5f5 (light)
- backgroundElement: #2a2139 (dark), #eeeeee (light)
- border: #495495 (dark), #e0e0e0 (light)
- borderActive: cyan (dark), #00bcd4 (light)
- borderSubtle: #241b2f (dark), #f0f0f0 (light)
- diffAdded: green (dark), #4caf50 (light)
- diffRemoved: red (dark), #f44336 (light)
- diffContext: foregroundMuted (dark), #5c5c8a (light)
- diffHunkHeader: purple (dark), #9c27b0 (light)
- diffHighlightAdded: greenBright (dark), #4caf50 (light)
- diffHighlightRemoved: redBright (dark), #f44336 (light)
- diffAddedBg: #1a3a2a (dark), #e8f5e9 (light)
- diffRemovedBg: #3a1a2a (dark), #ffebee (light)
- diffContextBg: #1e1a29 (dark), #f5f5f5 (light)
- diffLineNumber: #495495 (dark), #b0b0b0 (light)
- diffAddedLineNumberBg: #1a3a2a (dark), #e8f5e9 (light)
- diffRemovedLineNumberBg: #3a1a2a (dark), #ffebee (light)
- markdownText: foreground (dark), #262335 (light)
- markdownHeading: pink (dark), #e91e63 (light)
- markdownLink: cyan (dark), #00bcd4 (light)
- markdownLinkText: purple (dark), #9c27b0 (light)
- markdownCode: green (dark), #4caf50 (light)
- markdownBlockQuote: foregroundMuted (dark), #5c5c8a (light)
- markdownEmph: yellow (dark), #ff9800 (light)
- markdownStrong: orange (dark), #ff5722 (light)
- markdownHorizontalRule: #495495 (dark), #e0e0e0 (light)
- markdownListItem: cyan (dark), #00bcd4 (light)
- markdownListEnumeration: purple (dark), #9c27b0 (light)
- markdownImage: cyan (dark), #00bcd4 (light)
- markdownImageText: purple (dark), #9c27b0 (light)
- markdownCodeBlock: foreground (dark), #262335 (light)
- syntaxComment: foregroundMuted (dark), #5c5c8a (light)
- syntaxKeyword: pink (dark), #e91e63 (light)
- syntaxFunction: orange (dark), #ff5722 (light)
- syntaxVariable: foreground (dark), #262335 (light)
- syntaxString: yellow (dark), #ff9800 (light)
- syntaxNumber: purple (dark), #9c27b0 (light)
- syntaxType: cyan (dark), #00bcd4 (light)
- syntaxOperator: pink (dark), #e91e63 (light)
- syntaxPunctuation: foreground (dark), #262335 (light)

### Solarized Theme

**Defs:**

- base03: #002b36
- base02: #073642
- base01: #586e75
- base00: #657b83
- base0: #839496
- base1: #93a1a1
- base2: #eee8d5
- base3: #fdf6e3
- yellow: #b58900
- orange: #cb4b16
- red: #dc322f
- magenta: #d33682
- violet: #6c71c4
- blue: #268bd2
- cyan: #2aa198
- green: #859900

**Theme Mappings:**

- primary: blue (dark), blue (light)
- secondary: violet (dark), violet (light)
- accent: cyan (dark), cyan (light)
- error: red (dark), red (light)
- warning: yellow (dark), yellow (light)
- success: green (dark), green (light)
- info: orange (dark), orange (light)
- text: base0 (dark), base00 (light)
- textMuted: base01 (dark), base1 (light)
- background: base03 (dark), base3 (light)
- backgroundPanel: base02 (dark), base2 (light)
- backgroundElement: #073642 (dark), #eee8d5 (light)
- border: base02 (dark), base2 (light)
- borderActive: base01 (dark), base1 (light)
- borderSubtle: #073642 (dark), #eee8d5 (light)
- diffAdded: green (dark), green (light)
- diffRemoved: red (dark), red (light)
- diffContext: base01 (dark), base1 (light)
- diffHunkHeader: base01 (dark), base1 (light)
- diffHighlightAdded: green (dark), green (light)
- diffHighlightRemoved: red (dark), red (light)
- diffAddedBg: #073642 (dark), #eee8d5 (light)
- diffRemovedBg: #073642 (dark), #eee8d5 (light)
- diffContextBg: base02 (dark), base2 (light)
- diffLineNumber: base01 (dark), base1 (light)
- diffAddedLineNumberBg: #073642 (dark), #eee8d5 (light)
- diffRemovedLineNumberBg: #073642 (dark), #eee8d5 (light)
- markdownText: base0 (dark), base00 (light)
- markdownHeading: blue (dark), blue (light)
- markdownLink: cyan (dark), cyan (light)
- markdownLinkText: violet (dark), violet (light)
- markdownCode: green (dark), green (light)
- markdownBlockQuote: base01 (dark), base1 (light)
- markdownEmph: yellow (dark), yellow (light)
- markdownStrong: orange (dark), orange (light)
- markdownHorizontalRule: base01 (dark), base1 (light)
- markdownListItem: blue (dark), blue (light)
- markdownListEnumeration: cyan (dark), cyan (light)
- markdownImage: cyan (dark), cyan (light)
- markdownImageText: violet (dark), violet (light)
- markdownCodeBlock: base0 (dark), base00 (light)
- syntaxComment: base01 (dark), base1 (light)
- syntaxKeyword: green (dark), green (light)
- syntaxFunction: blue (dark), blue (light)
- syntaxVariable: cyan (dark), cyan (light)
- syntaxString: cyan (dark), cyan (light)
- syntaxNumber: magenta (dark), magenta (light)
- syntaxType: yellow (dark), yellow (light)
- syntaxOperator: green (dark), green (light)
- syntaxPunctuation: base0 (dark), base00 (light)

### Rosepine Theme

**Defs:**

- base: #191724
- surface: #1f1d2e
- overlay: #26233a
- muted: #6e6a86
- subtle: #908caa
- text: #e0def4
- love: #eb6f92
- gold: #f6c177
- rose: #ebbcba
- pine: #31748f
- foam: #9ccfd8
- iris: #c4a7e7
- highlightLow: #21202e
- highlightMed: #403d52
- highlightHigh: #524f67
- moonBase: #232136
- moonSurface: #2a273f
- moonOverlay: #393552
- moonMuted: #6e6a86
- moonSubtle: #908caa
- moonText: #e0def4
- dawnBase: #faf4ed
- dawnSurface: #fffaf3
- dawnOverlay: #f2e9e1
- dawnMuted: #9893a5
- dawnSubtle: #797593
- dawnText: #575279

**Theme Mappings:**

- primary: foam (dark), pine (light)
- secondary: iris (dark), #907aa9 (light)
- accent: rose (dark), #d7827e (light)
- error: love (dark), #b4637a (light)
- warning: gold (dark), #ea9d34 (light)
- success: pine (dark), #286983 (light)
- info: foam (dark), #56949f (light)
- text: #e0def4 (dark), #575279 (light)
- textMuted: muted (dark), dawnMuted (light)
- background: base (dark), dawnBase (light)
- backgroundPanel: surface (dark), dawnSurface (light)
- backgroundElement: overlay (dark), dawnOverlay (light)
- border: highlightMed (dark), #dfdad9 (light)
- borderActive: foam (dark), pine (light)
- borderSubtle: highlightLow (dark), #f4ede8 (light)
- diffAdded: pine (dark), #286983 (light)
- diffRemoved: love (dark), #b4637a (light)
- diffContext: muted (dark), dawnMuted (light)
- diffHunkHeader: iris (dark), #907aa9 (light)
- diffHighlightAdded: pine (dark), #286983 (light)
- diffHighlightRemoved: love (dark), #b4637a (light)
- diffAddedBg: #1f2d3a (dark), #e5f2f3 (light)
- diffRemovedBg: #3a1f2d (dark), #fce5e8 (light)
- diffContextBg: surface (dark), dawnSurface (light)
- diffLineNumber: muted (dark), dawnMuted (light)
- diffAddedLineNumberBg: #1f2d3a (dark), #e5f2f3 (light)
- diffRemovedLineNumberBg: #3a1f2d (dark), #fce5e8 (light)
- markdownText: #e0def4 (dark), #575279 (light)
- markdownHeading: iris (dark), #907aa9 (light)
- markdownLink: foam (dark), pine (light)
- markdownLinkText: rose (dark), #d7827e (light)
- markdownCode: pine (dark), #286983 (light)
- markdownBlockQuote: muted (dark), dawnMuted (light)
- markdownEmph: gold (dark), #ea9d34 (light)
- markdownStrong: love (dark), #b4637a (light)
- markdownHorizontalRule: highlightMed (dark), #dfdad9 (light)
- markdownListItem: foam (dark), pine (light)
- markdownListEnumeration: rose (dark), #d7827e (light)
- markdownImage: foam (dark), pine (light)
- markdownImageText: rose (dark), #d7827e (light)
- markdownCodeBlock: #e0def4 (dark), #575279 (light)
- syntaxComment: muted (dark), dawnMuted (light)
- syntaxKeyword: pine (dark), #286983 (light)
- syntaxFunction: rose (dark), #d7827e (light)
- syntaxVariable: #e0def4 (dark), #575279 (light)
- syntaxString: gold (dark), #ea9d34 (light)
- syntaxNumber: iris (dark), #907aa9 (light)
- syntaxType: foam (dark), #56949f (light)
- syntaxOperator: subtle (dark), dawnSubtle (light)
- syntaxPunctuation: subtle (dark), dawnSubtle (light)

### Palenight Theme

**Defs:**

- background: #292d3e
- backgroundAlt: #1e2132
- backgroundPanel: #32364a
- foreground: #a6accd
- foregroundBright: #bfc7d5
- comment: #676e95
- red: #f07178
- orange: #f78c6c
- yellow: #ffcb6b
- green: #c3e88d
- cyan: #89ddff
- blue: #82aaff
- purple: #c792ea
- magenta: #ff5370
- pink: #f07178

**Theme Mappings:**

- primary: blue (dark), #4976eb (light)
- secondary: purple (dark), #a854f2 (light)
- accent: cyan (dark), #00acc1 (light)
- error: red (dark), #e53935 (light)
- warning: yellow (dark), #ffb300 (light)
- success: green (dark), #91b859 (light)
- info: orange (dark), #f4511e (light)
- text: foreground (dark), #292d3e (light)
- textMuted: comment (dark), #8796b0 (light)
- background: #292d3e (dark), #fafafa (light)
- backgroundPanel: #1e2132 (dark), #f5f5f5 (light)
- backgroundElement: #32364a (dark), #e7e7e8 (light)
- border: #32364a (dark), #e0e0e0 (light)
- borderActive: blue (dark), #4976eb (light)
- borderSubtle: #1e2132 (dark), #eeeeee (light)
- diffAdded: green (dark), #91b859 (light)
- diffRemoved: red (dark), #e53935 (light)
- diffContext: comment (dark), #8796b0 (light)
- diffHunkHeader: cyan (dark), #00acc1 (light)
- diffHighlightAdded: green (dark), #91b859 (light)
- diffHighlightRemoved: red (dark), #e53935 (light)
- diffAddedBg: #2e3c2b (dark), #e8f5e9 (light)
- diffRemovedBg: #3c2b2b (dark), #ffebee (light)
- diffContextBg: #1e2132 (dark), #f5f5f5 (light)
- diffLineNumber: #444760 (dark), #cfd8dc (light)
- diffAddedLineNumberBg: #2e3c2b (dark), #e8f5e9 (light)
- diffRemovedLineNumberBg: #3c2b2b (dark), #ffebee (light)
- markdownText: foreground (dark), #292d3e (light)
- markdownHeading: purple (dark), #a854f2 (light)
- markdownLink: blue (dark), #4976eb (light)
- markdownLinkText: cyan (dark), #00acc1 (light)
- markdownCode: green (dark), #91b859 (light)
- markdownBlockQuote: comment (dark), #8796b0 (light)
- markdownEmph: yellow (dark), #ffb300 (light)
- markdownStrong: orange (dark), #f4511e (light)
- markdownHorizontalRule: comment (dark), #8796b0 (light)
- markdownListItem: blue (dark), #4976eb (light)
- markdownListEnumeration: cyan (dark), #00acc1 (light)
- markdownImage: blue (dark), #4976eb (light)
- markdownImageText: cyan (dark), #00acc1 (light)
- markdownCodeBlock: foreground (dark), #292d3e (light)
- syntaxComment: comment (dark), #8796b0 (light)
- syntaxKeyword: purple (dark), #a854f2 (light)
- syntaxFunction: blue (dark), #4976eb (light)
- syntaxVariable: foreground (dark), #292d3e (light)
- syntaxString: green (dark), #91b859 (light)
- syntaxNumber: orange (dark), #f4511e (light)
- syntaxType: yellow (dark), #ffb300 (light)
- syntaxOperator: cyan (dark), #00acc1 (light)
- syntaxPunctuation: foreground (dark), #292d3e (light)

### OpenCode Theme

**Defs:**

- darkStep1: #0a0a0a
- darkStep2: #141414
- darkStep3: #1e1e1e
- darkStep4: #282828
- darkStep5: #323232
- darkStep6: #3c3c3c
- darkStep7: #484848
- darkStep8: #606060
- darkStep9: #fab283
- darkStep10: #ffc09f
- darkStep11: #808080
- darkStep12: #eeeeee
- darkSecondary: #5c9cf5
- darkAccent: #9d7cd8
- darkRed: #e06c75
- darkOrange: #f5a742
- darkGreen: #7fd88f
- darkCyan: #56b6c2
- darkYellow: #e5c07b
- lightStep1: #ffffff
- lightStep2: #fafafa
- lightStep3: #f5f5f5
- lightStep4: #ebebeb
- lightStep5: #e1e1e1
- lightStep6: #d4d4d4
- lightStep7: #b8b8b8
- lightStep8: #a0a0a0
- lightStep9: #3b7dd8
- lightStep10: #2968c3
- lightStep11: #8a8a8a
- lightStep12: #1a1a1a
- lightSecondary: #7b5bb6
- lightAccent: #d68c27
- lightRed: #d1383d
- lightOrange: #d68c27
- lightGreen: #3d9a57
- lightCyan: #318795
- lightYellow: #b0851f

**Theme Mappings:**

- primary: darkStep9 (dark), lightStep9 (light)
- secondary: darkSecondary (dark), lightSecondary (light)
- accent: darkAccent (dark), lightAccent (light)
- error: darkRed (dark), lightRed (light)
- warning: darkOrange (dark), lightOrange (light)
- success: darkGreen (dark), lightGreen (light)
- info: darkCyan (dark), lightCyan (light)
- text: darkStep12 (dark), lightStep12 (light)
- textMuted: darkStep11 (dark), lightStep11 (light)
- background: darkStep1 (dark), lightStep1 (light)
- backgroundPanel: darkStep2 (dark), lightStep2 (light)
- backgroundElement: darkStep3 (dark), lightStep3 (light)
- border: darkStep7 (dark), lightStep7 (light)
- borderActive: darkStep8 (dark), lightStep8 (light)
- borderSubtle: darkStep6 (dark), lightStep6 (light)
- diffAdded: #4fd6be (dark), #1e725c (light)
- diffRemoved: #c53b53 (dark), #c53b53 (light)
- diffContext: #828bb8 (dark), #7086b5 (light)
- diffHunkHeader: #828bb8 (dark), #7086b5 (light)
- diffHighlightAdded: #b8db87 (dark), #4db380 (light)
- diffHighlightRemoved: #e26a75 (dark), #f52a65 (light)
- diffAddedBg: #20303b (dark), #d5e5d5 (light)
- diffRemovedBg: #37222c (dark), #f7d8db (light)
- diffContextBg: darkStep2 (dark), lightStep2 (light)
- diffLineNumber: darkStep3 (dark), lightStep3 (light)
- diffAddedLineNumberBg: #1b2b34 (dark), #c5d5c5 (light)
- diffRemovedLineNumberBg: #2d1f26 (dark), #e7c8cb (light)
- markdownText: darkStep12 (dark), lightStep12 (light)
- markdownHeading: darkAccent (dark), lightAccent (light)
- markdownLink: darkStep9 (dark), lightStep9 (light)
- markdownLinkText: darkCyan (dark), lightCyan (light)
- markdownCode: darkGreen (dark), lightGreen (light)
- markdownBlockQuote: darkYellow (dark), lightYellow (light)
- markdownEmph: darkYellow (dark), lightYellow (light)
- markdownStrong: darkOrange (dark), lightOrange (light)
- markdownHorizontalRule: darkStep11 (dark), lightStep11 (light)
- markdownListItem: darkStep9 (dark), lightStep9 (light)
- markdownListEnumeration: darkCyan (dark), lightCyan (light)
- markdownImage: darkStep9 (dark), lightStep9 (light)
- markdownImageText: darkCyan (dark), lightCyan (light)
- markdownCodeBlock: darkStep12 (dark), lightStep12 (light)
- syntaxComment: darkStep11 (dark), lightStep11 (light)
- syntaxKeyword: darkAccent (dark), lightAccent (light)
- syntaxFunction: darkStep9 (dark), lightStep9 (light)
- syntaxVariable: darkRed (dark), lightRed (light)
- syntaxString: darkGreen (dark), lightGreen (light)
- syntaxNumber: darkOrange (dark), lightOrange (light)
- syntaxType: darkYellow (dark), lightYellow (light)
- syntaxOperator: darkCyan (dark), lightCyan (light)
- syntaxPunctuation: darkStep12 (dark), lightStep12 (light)

### One Dark Theme

**Defs:**

- darkBg: #282c34
- darkBgAlt: #21252b
- darkBgPanel: #353b45
- darkFg: #abb2bf
- darkFgMuted: #5c6370
- darkPurple: #c678dd
- darkBlue: #61afef
- darkRed: #e06c75
- darkGreen: #98c379
- darkYellow: #e5c07b
- darkOrange: #d19a66
- darkCyan: #56b6c2
- lightBg: #fafafa
- lightBgAlt: #f0f0f1
- lightBgPanel: #eaeaeb
- lightFg: #383a42
- lightFgMuted: #a0a1a7
- lightPurple: #a626a4
- lightBlue: #4078f2
- lightRed: #e45649
- lightGreen: #50a14f
- lightYellow: #c18401
- lightOrange: #986801
- lightCyan: #0184bc

**Theme Mappings:**

- primary: darkBlue (dark), lightBlue (light)
- secondary: darkPurple (dark), lightPurple (light)
- accent: darkCyan (dark), lightCyan (light)
- error: darkRed (dark), lightRed (light)
- warning: darkYellow (dark), lightYellow (light)
- success: darkGreen (dark), lightGreen (light)
- info: darkOrange (dark), lightOrange (light)
- text: darkFg (dark), lightFg (light)
- textMuted: darkFgMuted (dark), lightFgMuted (light)
- background: darkBg (dark), lightBg (light)
- backgroundPanel: darkBgAlt (dark), lightBgAlt (light)
- backgroundElement: darkBgPanel (dark), lightBgPanel (light)
- border: #393f4a (dark), #d1d1d2 (light)
- borderActive: darkBlue (dark), lightBlue (light)
- borderSubtle: #2c313a (dark), #e0e0e1 (light)
- diffAdded: darkGreen (dark), lightGreen (light)
- diffRemoved: darkRed (dark), lightRed (light)
- diffContext: darkFgMuted (dark), lightFgMuted (light)
- diffHunkHeader: darkCyan (dark), lightCyan (light)
- diffHighlightAdded: #aad482 (dark), #489447 (light)
- diffHighlightRemoved: #e8828b (dark), #d65145 (light)
- diffAddedBg: #2c382b (dark), #eafbe9 (light)
- diffRemovedBg: #3a2d2f (dark), #fce9e8 (light)
- diffContextBg: darkBgAlt (dark), lightBgAlt (light)
- diffLineNumber: #495162 (dark), #c9c9ca (light)
- diffAddedLineNumberBg: #283427 (dark), #e1f3df (light)
- diffRemovedLineNumberBg: #36292b (dark), #f5e2e1 (light)
- markdownText: darkFg (dark), lightFg (light)
- markdownHeading: darkPurple (dark), lightPurple (light)
- markdownLink: darkBlue (dark), lightBlue (light)
- markdownLinkText: darkCyan (dark), lightCyan (light)
- markdownCode: darkGreen (dark), lightGreen (light)
- markdownBlockQuote: darkFgMuted (dark), lightFgMuted (light)
- markdownEmph: darkYellow (dark), lightYellow (light)
- markdownStrong: darkOrange (dark), lightOrange (light)
- markdownHorizontalRule: darkFgMuted (dark), lightFgMuted (light)
- markdownListItem: darkBlue (dark), lightBlue (light)
- markdownListEnumeration: darkCyan (dark), lightCyan (light)
- markdownImage: darkBlue (dark), lightBlue (light)
- markdownImageText: darkCyan (dark), lightCyan (light)
- markdownCodeBlock: darkFg (dark), lightFg (light)
- syntaxComment: darkFgMuted (dark), lightFgMuted (light)
- syntaxKeyword: darkPurple (dark), lightPurple (light)
- syntaxFunction: darkBlue (dark), lightBlue (light)
- syntaxVariable: darkRed (dark), lightRed (light)
- syntaxString: darkGreen (dark), lightGreen (light)
- syntaxNumber: darkOrange (dark), lightOrange (light)
- syntaxType: darkYellow (dark), lightYellow (light)
- syntaxOperator: darkCyan (dark), lightCyan (light)
- syntaxPunctuation: darkFg (dark), lightFg (light)

### Nord Theme

**Defs:**

- nord0: #2E3440
- nord1: #3B4252
- nord2: #434C5E
- nord3: #4C566A
- nord4: #D8DEE9
- nord5: #E5E9F0
- nord6: #ECEFF4
- nord7: #8FBCBB
- nord8: #88C0D0
- nord9: #81A1C1
- nord10: #5E81AC
- nord11: #BF616A
- nord12: #D08770
- nord13: #EBCB8B
- nord14: #A3BE8C
- nord15: #B48EAD

**Theme Mappings:**

- primary: nord8 (dark), nord10 (light)
- secondary: nord9 (dark), nord9 (light)
- accent: nord7 (dark), nord7 (light)
- error: nord11 (dark), nord11 (light)
- warning: nord12 (dark), nord12 (light)
- success: nord14 (dark), nord14 (light)
- info: nord8 (dark), nord10 (light)
- text: nord6 (dark), nord0 (light)
- textMuted: #8B95A7 (dark), nord1 (light)
- background: nord0 (dark), nord6 (light)
- backgroundPanel: nord1 (dark), nord5 (light)
- backgroundElement: nord2 (dark), nord4 (light)
- border: nord2 (dark), nord3 (light)
- borderActive: nord3 (dark), nord2 (light)
- borderSubtle: nord2 (dark), nord3 (light)
- diffAdded: nord14 (dark), nord14 (light)
- diffRemoved: nord11 (dark), nord11 (light)
- diffContext: #8B95A7 (dark), nord3 (light)
- diffHunkHeader: #8B95A7 (dark), nord3 (light)
- diffHighlightAdded: nord14 (dark), nord14 (light)
- diffHighlightRemoved: nord11 (dark), nord11 (light)
- diffAddedBg: #3B4252 (dark), #E5E9F0 (light)
- diffRemovedBg: #3B4252 (dark), #E5E9F0 (light)
- diffContextBg: nord1 (dark), nord5 (light)
- diffLineNumber: nord2 (dark), nord4 (light)
- diffAddedLineNumberBg: #3B4252 (dark), #E5E9F0 (light)
- diffRemovedLineNumberBg: #3B4252 (dark), #E5E9F0 (light)
- markdownText: nord4 (dark), nord0 (light)
- markdownHeading: nord8 (dark), nord10 (light)
- markdownLink: nord9 (dark), nord9 (light)
- markdownLinkText: nord7 (dark), nord7 (light)
- markdownCode: nord14 (dark), nord14 (light)
- markdownBlockQuote: #8B95A7 (dark), nord3 (light)
- markdownEmph: nord12 (dark), nord12 (light)
- markdownStrong: nord13 (dark), nord13 (light)
- markdownHorizontalRule: #8B95A7 (dark), nord3 (light)
- markdownListItem: nord8 (dark), nord10 (light)
- markdownListEnumeration: nord7 (dark), nord7 (light)
- markdownImage: nord9 (dark), nord9 (light)
- markdownImageText: nord7 (dark), nord7 (light)
- markdownCodeBlock: nord4 (dark), nord0 (light)
- syntaxComment: #8B95A7 (dark), nord3 (light)
- syntaxKeyword: nord9 (dark), nord9 (light)
- syntaxFunction: nord8 (dark), nord8 (light)
- syntaxVariable: nord7 (dark), nord7 (light)
- syntaxString: nord14 (dark), nord14 (light)
- syntaxNumber: nord15 (dark), nord15 (light)
- syntaxType: nord7 (dark), nord7 (light)
- syntaxOperator: nord9 (dark), nord9 (light)
- syntaxPunctuation: nord4 (dark), nord0 (light)

### Cobalt2 Theme

**Defs:**

- background: #193549
- backgroundAlt: #122738
- backgroundPanel: #1f4662
- foreground: #ffffff
- foregroundMuted: #adb7c9
- yellow: #ffc600
- yellowBright: #ffe14c
- orange: #ff9d00
- orangeBright: #ffb454
- mint: #2affdf
- mintBright: #7efff5
- blue: #0088ff
- blueBright: #5cb7ff
- pink: #ff628c
- pinkBright: #ff86a5
- green: #9eff80
- greenBright: #b9ff9f
- purple: #9a5feb
- purpleBright: #b88cfd
- red: #ff0088
- redBright: #ff5fb3

**Theme Mappings:**

- primary: blue (dark), #0066cc (light)
- secondary: purple (dark), #7c4dff (light)
- accent: mint (dark), #00acc1 (light)
- error: red (dark), #e91e63 (light)
- warning: yellow (dark), #ff9800 (light)
- success: green (dark), #4caf50 (light)
- info: orange (dark), #ff5722 (light)
- text: foreground (dark), #193549 (light)
- textMuted: foregroundMuted (dark), #5c6b7d (light)
- background: #193549 (dark), #ffffff (light)
- backgroundPanel: #122738 (dark), #f5f7fa (light)
- backgroundElement: #1f4662 (dark), #e8ecf1 (light)
- border: #1f4662 (dark), #d3dae3 (light)
- borderActive: blue (dark), #0066cc (light)
- borderSubtle: #0e1e2e (dark), #e8ecf1 (light)
- diffAdded: green (dark), #4caf50 (light)
- diffRemoved: red (dark), #e91e63 (light)
- diffContext: foregroundMuted (dark), #5c6b7d (light)
- diffHunkHeader: mint (dark), #00acc1 (light)
- diffHighlightAdded: greenBright (dark), #4caf50 (light)
- diffHighlightRemoved: redBright (dark), #e91e63 (light)
- diffAddedBg: #1a3a2a (dark), #e8f5e9 (light)
- diffRemovedBg: #3a1a2a (dark), #ffebee (light)
- diffContextBg: #122738 (dark), #f5f7fa (light)
- diffLineNumber: #2d5a7b (dark), #b0bec5 (light)
- diffAddedLineNumberBg: #1a3a2a (dark), #e8f5e9 (light)
- diffRemovedLineNumberBg: #3a1a2a (dark), #ffebee (light)
- markdownText: foreground (dark), #193549 (light)
- markdownHeading: yellow (dark), #ff9800 (light)
- markdownLink: blue (dark), #0066cc (light)
- markdownLinkText: mint (dark), #00acc1 (light)
- markdownCode: green (dark), #4caf50 (light)
- markdownBlockQuote: foregroundMuted (dark), #5c6b7d (light)
- markdownEmph: orange (dark), #ff5722 (light)
- markdownStrong: pink (dark), #e91e63 (light)
- markdownHorizontalRule: #2d5a7b (dark), #d3dae3 (light)
- markdownListItem: blue (dark), #0066cc (light)
- markdownListEnumeration: mint (dark), #00acc1 (light)
- markdownImage: blue (dark), #0066cc (light)
- markdownImageText: mint (dark), #00acc1 (light)
- markdownCodeBlock: foreground (dark), #193549 (light)
- syntaxComment: #0088ff (dark), #5c6b7d (light)
- syntaxKeyword: orange (dark), #ff5722 (light)
- syntaxFunction: yellow (dark), #ff9800 (light)
- syntaxVariable: foreground (dark), #193549 (light)
- syntaxString: green (dark), #4caf50 (light)
- syntaxNumber: pink (dark), #e91e63 (light)
- syntaxType: mint (dark), #00acc1 (light)
- syntaxOperator: orange (dark), #ff5722 (light)
- syntaxPunctuation: foreground (dark), #193549 (light)

### Catppuccin Theme

**Defs:**

- lightRosewater: #dc8a78
- lightFlamingo: #dd7878
- lightPink: #ea76cb
- lightMauve: #8839ef
- lightRed: #d20f39
- lightMaroon: #e64553
- lightPeach: #fe640b
- lightYellow: #df8e1d
- lightGreen: #40a02b
- lightTeal: #179299
- lightSky: #04a5e5
- lightSapphire: #209fb5
- lightBlue: #1e66f5
- lightLavender: #7287fd
- lightText: #4c4f69
- lightSubtext1: #5c5f77
- lightSubtext0: #6c6f85
- lightOverlay2: #7c7f93
- lightOverlay1: #8c8fa1
- lightOverlay0: #9ca0b0
- lightSurface2: #acb0be
- lightSurface1: #bcc0cc
- lightSurface0: #ccd0da
- lightBase: #eff1f5
- lightMantle: #e6e9ef
- lightCrust: #dce0e8
- darkRosewater: #f5e0dc
- darkFlamingo: #f2cdcd
- darkPink: #f5c2e7
- darkMauve: #cba6f7
- darkRed: #f38ba8
- darkMaroon: #eba0ac
- darkPeach: #fab387
- darkYellow: #f9e2af
- darkGreen: #a6e3a1
- darkTeal: #94e2d5
- darkSky: #89dceb
- darkSapphire: #74c7ec
- darkBlue: #89b4fa
- darkLavender: #b4befe
- darkText: #cdd6f4
- darkSubtext1: #bac2de
- darkSubtext0: #a6adc8
- darkOverlay2: #9399b2
- darkOverlay1: #7f849c
- darkOverlay0: #6c7086
- darkSurface2: #585b70
- darkSurface1: #45475a
- darkSurface0: #313244
- darkBase: #1e1e2e
- darkMantle: #181825
- darkCrust: #11111b

**Theme Mappings:**

- primary: darkBlue (dark), lightBlue (light)
- secondary: darkMauve (dark), lightMauve (light)
- accent: darkPink (dark), lightPink (light)
- error: darkRed (dark), lightRed (light)
- warning: darkYellow (dark), lightYellow (light)
- success: darkGreen (dark), lightGreen (light)
- info: darkTeal (dark), lightTeal (light)
- text: darkText (dark), lightText (light)
- textMuted: darkSubtext1 (dark), lightSubtext1 (light)
- background: darkBase (dark), lightBase (light)
- backgroundPanel: darkMantle (dark), lightMantle (light)
- backgroundElement: darkCrust (dark), lightCrust (light)
- border: darkSurface0 (dark), lightSurface0 (light)
- borderActive: darkSurface1 (dark), lightSurface1 (light)
- borderSubtle: darkSurface2 (dark), lightSurface2 (light)
- diffAdded: darkGreen (dark), lightGreen (light)
- diffRemoved: darkRed (dark), lightRed (light)
- diffContext: darkOverlay2 (dark), lightOverlay2 (light)
- diffHunkHeader: darkPeach (dark), lightPeach (light)
- diffHighlightAdded: darkGreen (dark), lightGreen (light)
- diffHighlightRemoved: darkRed (dark), lightRed (light)
- diffAddedBg: #24312b (dark), #d6f0d9 (light)
- diffRemovedBg: #3c2a32 (dark), #f6dfe2 (light)
- diffContextBg: darkMantle (dark), lightMantle (light)
- diffLineNumber: darkSurface1 (dark), lightSurface1 (light)
- diffAddedLineNumberBg: #1e2a25 (dark), #c9e3cb (light)
- diffRemovedLineNumberBg: #32232a (dark), #e9d3d6 (light)
- markdownText: darkText (dark), lightText (light)
- markdownHeading: darkMauve (dark), lightMauve (light)
- markdownLink: darkBlue (dark), lightBlue (light)
- markdownLinkText: darkSky (dark), lightSky (light)
- markdownCode: darkGreen (dark), lightGreen (light)
- markdownBlockQuote: darkYellow (dark), lightYellow (light)
- markdownEmph: darkYellow (dark), lightYellow (light)
- markdownStrong: darkPeach (dark), lightPeach (light)
- markdownHorizontalRule: darkSubtext0 (dark), lightSubtext0 (light)
- markdownListItem: darkBlue (dark), lightBlue (light)
- markdownListEnumeration: darkSky (dark), lightSky (light)
- markdownImage: darkBlue (dark), lightBlue (light)
- markdownImageText: darkSky (dark), lightSky (light)
- markdownCodeBlock: darkText (dark), lightText (light)
- syntaxComment: darkOverlay2 (dark), lightOverlay2 (light)
- syntaxKeyword: darkMauve (dark), lightMauve (light)
- syntaxFunction: darkBlue (dark), lightBlue (light)
- syntaxVariable: darkRed (dark), lightRed (light)
- syntaxString: darkGreen (dark), lightGreen (light)
- syntaxNumber: darkPeach (dark), lightPeach (light)
- syntaxType: darkYellow (dark), lightYellow (light)
- syntaxOperator: darkSky (dark), lightSky (light)
- syntaxPunctuation: darkText (dark), lightText (light)

### Ayu Theme

**Defs:**

- darkBg: #0B0E14
- darkBgAlt: #0D1017
- darkLine: #11151C
- darkPanel: #0F131A
- darkFg: #BFBDB6
- darkFgMuted: #565B66
- darkGutter: #6C7380
- darkTag: #39BAE6
- darkFunc: #FFB454
- darkEntity: #59C2FF
- darkString: #AAD94C
- darkRegexp: #95E6CB
- darkMarkup: #F07178
- darkKeyword: #FF8F40
- darkSpecial: #E6B673
- darkComment: #ACB6BF
- darkConstant: #D2A6FF
- darkOperator: #F29668
- darkAdded: #7FD962
- darkRemoved: #F26D78
- darkAccent: #E6B450
- darkError: #D95757
- darkIndentActive: #6C7380

**Theme Mappings:**

- primary: darkEntity
- secondary: darkConstant
- accent: darkAccent
- error: darkError
- warning: darkSpecial
- success: darkAdded
- info: darkTag
- text: darkFg
- textMuted: darkFgMuted
- background: darkBg
- backgroundPanel: darkPanel
- backgroundElement: darkBgAlt
- border: darkGutter
- borderActive: darkIndentActive
- borderSubtle: darkLine
- diffAdded: darkAdded
- diffRemoved: darkRemoved
- diffContext: darkComment
- diffHunkHeader: darkComment
- diffHighlightAdded: darkString
- diffHighlightRemoved: darkMarkup
- diffAddedBg: #20303b
- diffRemovedBg: #37222c
- diffContextBg: darkPanel
- diffLineNumber: darkGutter
- diffAddedLineNumberBg: #1b2b34
- diffRemovedLineNumberBg: #2d1f26
- markdownText: darkFg
- markdownHeading: darkConstant
- markdownLink: darkEntity
- markdownLinkText: darkTag
- markdownCode: darkString
- markdownBlockQuote: darkSpecial
- markdownEmph: darkSpecial
- markdownStrong: darkFunc
- markdownHorizontalRule: darkFgMuted
- markdownListItem: darkEntity
- markdownListEnumeration: darkTag
- markdownImage: darkEntity
- markdownImageText: darkTag
- markdownCodeBlock: darkFg
- syntaxComment: darkComment
- syntaxKeyword: darkKeyword
- syntaxFunction: darkFunc
- syntaxVariable: darkEntity
- syntaxString: darkString
- syntaxNumber: darkConstant
- syntaxType: darkSpecial
- syntaxOperator: darkOperator
- syntaxPunctuation: darkFg

### Aura Theme

**Defs:**

- darkBg: #0f0f0f
- darkBgPanel: #15141b
- darkBorder: #2d2d2d
- darkFgMuted: #6d6d6d
- darkFg: #edecee
- purple: #a277ff
- pink: #f694ff
- blue: #82e2ff
- red: #ff6767
- orange: #ffca85
- cyan: #61ffca
- green: #9dff65

**Theme Mappings:**

- primary: #a277ff (dark), #a277ff (light)
- secondary: #f694ff (dark), #f694ff (light)
- accent: #a277ff (dark), #a277ff (light)
- error: #ff6767 (dark), #ff6767 (light)
- warning: #ffca85 (dark), #ffca85 (light)
- success: #61ffca (dark), #61ffca (light)
- info: #a277ff (dark), #a277ff (light)
- text: #edecee (dark), #edecee (light)
- textMuted: #6d6d6d (dark), #6d6d6d (light)
- background: #0f0f0f (dark), #0f0f0f (light)
- backgroundPanel: #15141b (dark), #15141b (light)
- backgroundElement: #15141b (dark), #15141b (light)
- border: #2d2d2d (dark), #2d2d2d (light)
- borderActive: #6d6d6d (dark), #6d6d6d (light)
- borderSubtle: #2d2d2d (dark), #2d2d2d (light)
- diffAdded: #61ffca (dark), #61ffca (light)
- diffRemoved: #ff6767 (dark), #ff6767 (light)
- diffContext: #6d6d6d (dark), #6d6d6d (light)
- diffHunkHeader: #6d6d6d (dark), #6d6d6d (light)
- diffHighlightAdded: #61ffca (dark), #61ffca (light)
- diffHighlightRemoved: #ff6767 (dark), #ff6767 (light)
- diffAddedBg: #354933 (dark), #354933 (light)
- diffRemovedBg: #3f191a (dark), #3f191a (light)
- diffContextBg: #15141b (dark), #15141b (light)
- diffLineNumber: #2d2d2d (dark), #2d2d2d (light)
- diffAddedLineNumberBg: #162620 (dark), #162620 (light)
- diffRemovedLineNumberBg: #26161a (dark), #26161a (light)
- markdownText: #edecee (dark), #edecee (light)
- markdownHeading: #a277ff (dark), #a277ff (light)
- markdownLink: #f694ff (dark), #f694ff (light)
- markdownLinkText: #a277ff (dark), #a277ff (light)
- markdownCode: #61ffca (dark), #61ffca (light)
- markdownBlockQuote: #6d6d6d (dark), #6d6d6d (light)
- markdownEmph: #ffca85 (dark), #ffca85 (light)
- markdownStrong: #a277ff (dark), #a277ff (light)
- markdownHorizontalRule: #6d6d6d (dark), #6d6d6d (light)
- markdownListItem: #a277ff (dark), #a277ff (light)
- markdownListEnumeration: #a277ff (dark), #a277ff (light)
- markdownImage: #f694ff (dark), #f694ff (light)
- markdownImageText: #a277ff (dark), #a277ff (light)
- markdownCodeBlock: #edecee (dark), #edecee (light)
- syntaxComment: #6d6d6d (dark), #6d6d6d (light)
- syntaxKeyword: #f694ff (dark), #f694ff (light)
- syntaxFunction: #a277ff (dark), #a277ff (light)
- syntaxVariable: #a277ff (dark), #a277ff (light)
- syntaxString: #61ffca (dark), #61ffca (light)
- syntaxNumber: #9dff65 (dark), #9dff65 (light)
- syntaxType: #a277ff (dark), #a277ff (light)
- syntaxOperator: #f694ff (dark), #f694ff (light)
- syntaxPunctuation: #edecee (dark), #edecee (light)

### Kanagawa Theme

**Defs:**

- sumiInk0: #1F1F28
- sumiInk1: #2A2A37
- sumiInk2: #363646
- sumiInk3: #54546D
- fujiWhite: #DCD7BA
- oldWhite: #C8C093
- fujiGray: #727169
- oniViolet: #957FB8
- crystalBlue: #7E9CD8
- carpYellow: #C38D9D
- sakuraPink: #D27E99
- waveAqua: #76946A
- roninYellow: #D7A657
- dragonRed: #E82424
- lotusGreen: #98BB6C
- waveBlue: #2D4F67

**Theme Mappings:**

- primary: crystalBlue (dark), waveBlue (light)
- secondary: oniViolet (dark), oniViolet (light)
- accent: sakuraPink (dark), sakuraPink (light)
- error: dragonRed (dark), dragonRed (light)
- warning: roninYellow (dark), roninYellow (light)
- success: lotusGreen (dark), lotusGreen (light)
- info: waveAqua (dark), waveAqua (light)
- text: fujiWhite (dark), lightText (light)
- textMuted: fujiGray (dark), lightGray (light)
- background: sumiInk0 (dark), lightBg (light)
- backgroundPanel: sumiInk1 (dark), lightPaper (light)
- backgroundElement: sumiInk2 (dark), #E3DCD2 (light)
- border: sumiInk3 (dark), #D4CBBF (light)
- borderActive: carpYellow (dark), carpYellow (light)
- borderSubtle: sumiInk2 (dark), #DCD4C9 (light)
- diffAdded: lotusGreen (dark), lotusGreen (light)
- diffRemoved: dragonRed (dark), dragonRed (light)
- diffContext: fujiGray (dark), lightGray (light)
- diffHunkHeader: waveBlue (dark), waveBlue (light)
- diffHighlightAdded: #A9D977 (dark), #89AF5B (light)
- diffHighlightRemoved: #F24A4A (dark), #D61F1F (light)
- diffAddedBg: #252E25 (dark), #EAF3E4 (light)
- diffRemovedBg: #362020 (dark), #FBE6E6 (light)
- diffContextBg: sumiInk1 (dark), lightPaper (light)
- diffLineNumber: sumiInk3 (dark), #C7BEB4 (light)
- diffAddedLineNumberBg: #202820 (dark), #DDE8D6 (light)
- diffRemovedLineNumberBg: #2D1C1C (dark), #F2DADA (light)
- markdownText: fujiWhite (dark), lightText (light)
- markdownHeading: oniViolet (dark), oniViolet (light)
- markdownLink: crystalBlue (dark), waveBlue (light)
- markdownLinkText: waveAqua (dark), waveAqua (light)
- markdownCode: lotusGreen (dark), lotusGreen (light)
- markdownBlockQuote: fujiGray (dark), lightGray (light)
- markdownEmph: carpYellow (dark), carpYellow (light)
- markdownStrong: roninYellow (dark), roninYellow (light)
- markdownHorizontalRule: fujiGray (dark), lightGray (light)
- markdownListItem: crystalBlue (dark), waveBlue (light)
- markdownListEnumeration: waveAqua (dark), waveAqua (light)
- markdownImage: crystalBlue (dark), waveBlue (light)
- markdownImageText: waveAqua (dark), waveAqua (light)
- markdownCodeBlock: fujiWhite (dark), lightText (light)
- syntaxComment: fujiGray (dark), lightGray (light)
- syntaxKeyword: oniViolet (dark), oniViolet (light)
- syntaxFunction: crystalBlue (dark), waveBlue (light)
- syntaxVariable: fujiWhite (dark), lightText (light)
- syntaxString: lotusGreen (dark), lotusGreen (light)
- syntaxNumber: roninYellow (dark), roninYellow (light)
- syntaxType: carpYellow (dark), carpYellow (light)
- syntaxOperator: sakuraPink (dark), sakuraPink (light)
- syntaxPunctuation: fujiWhite (dark), lightText (light)

### Gruvbox Theme

**Defs:**

- darkBg0: #282828
- darkBg1: #3c3836
- darkBg2: #504945
- darkBg3: #665c54
- darkFg0: #fbf1c7
- darkFg1: #ebdbb2
- darkGray: #928374
- darkRed: #cc241d
- darkGreen: #98971a
- darkYellow: #d79921
- darkBlue: #458588
- darkPurple: #b16286
- darkAqua: #689d6a
- darkOrange: #d65d0e
- darkRedBright: #fb4934
- darkGreenBright: #b8bb26
- darkYellowBright: #fabd2f
- darkBlueBright: #83a598
- darkPurpleBright: #d3869b
- darkAquaBright: #8ec07c
- darkOrangeBright: #fe8019
- lightBg0: #fbf1c7
- lightBg1: #ebdbb2
- lightBg2: #d5c4a1
- lightBg3: #bdae93
- lightFg0: #282828
- lightFg1: #3c3836
- lightGray: #7c6f64
- lightRed: #9d0006
- lightGreen: #79740e
- lightYellow: #b57614
- lightBlue: #076678
- lightPurple: #8f3f71
- lightAqua: #427b58
- lightOrange: #af3a03

**Theme Mappings:**

- primary: darkBlueBright (dark), lightBlue (light)
- secondary: darkPurpleBright (dark), lightPurple (light)
- accent: darkAquaBright (dark), lightAqua (light)
- error: darkRedBright (dark), lightRed (light)
- warning: darkOrangeBright (dark), lightOrange (light)
- success: darkGreenBright (dark), lightGreen (light)
- info: darkYellowBright (dark), lightYellow (light)
- text: darkFg1 (dark), lightFg1 (light)
- textMuted: darkGray (dark), lightGray (light)
- background: darkBg0 (dark), lightBg0 (light)
- backgroundPanel: darkBg1 (dark), lightBg1 (light)
- backgroundElement: darkBg2 (dark), lightBg2 (light)
- border: darkBg3 (dark), lightBg3 (light)
- borderActive: darkFg1 (dark), lightFg1 (light)
- borderSubtle: darkBg2 (dark), lightBg2 (light)
- diffAdded: darkGreen (dark), lightGreen (light)
- diffRemoved: darkRed (dark), lightRed (light)
- diffContext: darkGray (dark), lightGray (light)
- diffHunkHeader: darkAqua (dark), lightAqua (light)
- diffHighlightAdded: darkGreenBright (dark), lightGreen (light)
- diffHighlightRemoved: darkRedBright (dark), lightRed (light)
- diffAddedBg: #32302f (dark), #e2e0b5 (light)
- diffRemovedBg: #322929 (dark), #e9d8d5 (light)
- diffContextBg: darkBg1 (dark), lightBg1 (light)
- diffLineNumber: darkBg3 (dark), lightBg3 (light)
- diffAddedLineNumberBg: #2a2827 (dark), #d4d2a9 (light)
- diffRemovedLineNumberBg: #2a2222 (dark), #d8cbc8 (light)
- markdownText: darkFg1 (dark), lightFg1 (light)
- markdownHeading: darkBlueBright (dark), lightBlue (light)
- markdownLink: darkAquaBright (dark), lightAqua (light)
- markdownLinkText: darkGreenBright (dark), lightGreen (light)
- markdownCode: darkYellowBright (dark), lightYellow (light)
- markdownBlockQuote: darkGray (dark), lightGray (light)
- markdownEmph: darkPurpleBright (dark), lightPurple (light)
- markdownStrong: darkOrangeBright (dark), lightOrange (light)
- markdownHorizontalRule: darkGray (dark), lightGray (light)
- markdownListItem: darkBlueBright (dark), lightBlue (light)
- markdownListEnumeration: darkAquaBright (dark), lightAqua (light)
- markdownImage: darkAquaBright (dark), lightAqua (light)
- markdownImageText: darkGreenBright (dark), lightGreen (light)
- markdownCodeBlock: darkFg1 (dark), lightFg1 (light)
- syntaxComment: darkGray (dark), lightGray (light)
- syntaxKeyword: darkRedBright (dark), lightRed (light)
- syntaxFunction: darkGreenBright (dark), lightGreen (light)
- syntaxVariable: darkBlueBright (dark), lightBlue (light)
- syntaxString: darkYellowBright (dark), lightYellow (light)
- syntaxNumber: darkPurpleBright (dark), lightPurple (light)
- syntaxType: darkAquaBright (dark), lightAqua (light)
- syntaxOperator: darkOrangeBright (dark), lightOrange (light)
- syntaxPunctuation: darkFg1 (dark), lightFg1 (light)

### Github Theme

**Defs:**

- darkBg: #0d1117
- darkBgAlt: #010409
- darkBgPanel: #161b22
- darkFg: #c9d1d9
- darkFgMuted: #8b949e
- darkBlue: #58a6ff
- darkGreen: #3fb950
- darkRed: #f85149
- darkOrange: #d29922
- darkPurple: #bc8cff
- darkPink: #ff7b72
- darkYellow: #e3b341
- darkCyan: #39c5cf
- lightBg: #ffffff
- lightBgAlt: #f6f8fa
- lightBgPanel: #f0f3f6
- lightFg: #24292f
- lightFgMuted: #57606a
- lightBlue: #0969da
- lightGreen: #1a7f37
- lightRed: #cf222e
- lightOrange: #bc4c00
- lightPurple: #8250df
- lightPink: #bf3989
- lightYellow: #9a6700
- lightCyan: #1b7c83

**Theme Mappings:**

- primary: darkBlue (dark), lightBlue (light)
- secondary: darkPurple (dark), lightPurple (light)
- accent: darkCyan (dark), lightCyan (light)
- error: darkRed (dark), lightRed (light)
- warning: darkYellow (dark), lightYellow (light)
- success: darkGreen (dark), lightGreen (light)
- info: darkOrange (dark), lightOrange (light)
- text: darkFg (dark), lightFg (light)
- textMuted: darkFgMuted (dark), lightFgMuted (light)
- background: darkBg (dark), lightBg (light)
- backgroundPanel: darkBgAlt (dark), lightBgAlt (light)
- backgroundElement: darkBgPanel (dark), lightBgPanel (light)
- border: #30363d (dark), #d0d7de (light)
- borderActive: darkBlue (dark), lightBlue (light)
- borderSubtle: #21262d (dark), #d8dee4 (light)
- diffAdded: darkGreen (dark), lightGreen (light)
- diffRemoved: darkRed (dark), lightRed (light)
- diffContext: darkFgMuted (dark), lightFgMuted (light)
- diffHunkHeader: darkBlue (dark), lightBlue (light)
- diffHighlightAdded: #3fb950 (dark), #1a7f37 (light)
- diffHighlightRemoved: #f85149 (dark), #cf222e (light)
- diffAddedBg: #033a16 (dark), #dafbe1 (light)
- diffRemovedBg: #67060c (dark), #ffebe9 (light)
- diffContextBg: darkBgAlt (dark), lightBgAlt (light)
- diffLineNumber: #484f58 (dark), #afb8c1 (light)
- diffAddedLineNumberBg: #033a16 (dark), #dafbe1 (light)
- diffRemovedLineNumberBg: #67060c (dark), #ffebe9 (light)
- markdownText: darkFg (dark), lightFg (light)
- markdownHeading: darkBlue (dark), lightBlue (light)
- markdownLink: darkBlue (dark), lightBlue (light)
- markdownLinkText: darkCyan (dark), lightCyan (light)
- markdownCode: darkPink (dark), lightPink (light)
- markdownBlockQuote: darkFgMuted (dark), lightFgMuted (light)
- markdownEmph: darkYellow (dark), lightYellow (light)
- markdownStrong: darkOrange (dark), lightOrange (light)
- markdownHorizontalRule: #30363d (dark), #d0d7de (light)
- markdownListItem: darkBlue (dark), lightBlue (light)
- markdownListEnumeration: darkCyan (dark), lightCyan (light)
- markdownImage: darkBlue (dark), lightBlue (light)
- markdownImageText: darkCyan (dark), lightCyan (light)
- markdownCodeBlock: darkFg (dark), lightFg (light)
- syntaxComment: darkFgMuted (dark), lightFgMuted (light)
- syntaxKeyword: darkPink (dark), lightRed (light)
- syntaxFunction: darkPurple (dark), lightPurple (light)
- syntaxVariable: darkOrange (dark), lightOrange (light)
- syntaxString: darkCyan (dark), lightBlue (light)
- syntaxNumber: darkBlue (dark), lightCyan (light)
- syntaxType: darkOrange (dark), lightOrange (light)
- syntaxOperator: darkPink (dark), lightRed (light)
- syntaxPunctuation: darkFg (dark), lightFg (light)

### Everforest Theme

**Defs:**

- darkStep1: #2d353b
- darkStep2: #333c43
- darkStep3: #343f44
- darkStep4: #3d484d
- darkStep5: #475258
- darkStep6: #7a8478
- darkStep7: #859289
- darkStep8: #9da9a0
- darkStep9: #a7c080
- darkStep10: #83c092
- darkStep11: #7a8478
- darkStep12: #d3c6aa
- darkRed: #e67e80
- darkOrange: #e69875
- darkGreen: #a7c080
- darkCyan: #83c092
- darkYellow: #dbbc7f
- lightStep1: #fdf6e3
- lightStep2: #efebd4
- lightStep3: #f4f0d9
- lightStep4: #efebd4
- lightStep5: #e6e2cc
- lightStep6: #a6b0a0
- lightStep7: #939f91
- lightStep8: #829181
- lightStep9: #8da101
- lightStep10: #35a77c
- lightStep11: #a6b0a0
- lightStep12: #5c6a72
- lightRed: #f85552
- lightOrange: #f57d26
- lightGreen: #8da101
- lightCyan: #35a77c
- lightYellow: #dfa000

**Theme Mappings:**

- primary: darkStep9 (dark), lightStep9 (light)
- secondary: #7fbbb3 (dark), #3a94c5 (light)
- accent: #d699b6 (dark), #df69ba (light)
- error: darkRed (dark), lightRed (light)
- warning: darkOrange (dark), lightOrange (light)
- success: darkGreen (dark), lightGreen (light)
- info: darkCyan (dark), lightCyan (light)
- text: darkStep12 (dark), lightStep12 (light)
- textMuted: darkStep11 (dark), lightStep11 (light)
- background: darkStep1 (dark), lightStep1 (light)
- backgroundPanel: darkStep2 (dark), lightStep2 (light)
- backgroundElement: darkStep3 (dark), lightStep3 (light)
- border: darkStep7 (dark), lightStep7 (light)
- borderActive: darkStep8 (dark), lightStep8 (light)
- borderSubtle: darkStep6 (dark), lightStep6 (light)
- diffAdded: #4fd6be (dark), #1e725c (light)
- diffRemoved: #c53b53 (dark), #c53b53 (light)
- diffContext: #828bb8 (dark), #7086b5 (light)
- diffHunkHeader: #828bb8 (dark), #7086b5 (light)
- diffHighlightAdded: #b8db87 (dark), #4db380 (light)
- diffHighlightRemoved: #e26a75 (dark), #f52a65 (light)
- diffAddedBg: #20303b (dark), #d5e5d5 (light)
- diffRemovedBg: #37222c (dark), #f7d8db (light)
- diffContextBg: darkStep2 (dark), lightStep2 (light)
- diffLineNumber: darkStep3 (dark), lightStep3 (light)
- diffAddedLineNumberBg: #1b2b34 (dark), #c5d5c5 (light)
- diffRemovedLineNumberBg: #2d1f26 (dark), #e7c8cb (light)
- markdownText: darkStep12 (dark), lightStep12 (light)
- markdownHeading: #d699b6 (dark), #df69ba (light)
- markdownLink: darkStep9 (dark), lightStep9 (light)
- markdownLinkText: darkCyan (dark), lightCyan (light)
- markdownCode: darkGreen (dark), lightGreen (light)
- markdownBlockQuote: darkYellow (dark), lightYellow (light)
- markdownEmph: darkYellow (dark), lightYellow (light)
- markdownStrong: darkOrange (dark), lightOrange (light)
- markdownHorizontalRule: darkStep11 (dark), lightStep11 (light)
- markdownListItem: darkStep9 (dark), lightStep9 (light)
- markdownListEnumeration: darkCyan (dark), lightCyan (light)
- markdownImage: darkStep9 (dark), lightStep9 (light)
- markdownImageText: darkCyan (dark), lightCyan (light)
- markdownCodeBlock: darkStep12 (dark), lightStep12 (light)
- syntaxComment: darkStep11 (dark), lightStep11 (light)
- syntaxKeyword: #d699b6 (dark), #df69ba (light)
- syntaxFunction: darkStep9 (dark), lightStep9 (light)
- syntaxVariable: darkRed (dark), lightRed (light)
- syntaxString: darkGreen (dark), lightGreen (light)
- syntaxNumber: darkOrange (dark), lightOrange (light)
- syntaxType: darkYellow (dark), lightYellow (light)
- syntaxOperator: darkCyan (dark), lightCyan (light)
- syntaxPunctuation: darkStep12 (dark), lightStep12 (light)

### Matrix Theme

**Defs:**

- matrixInk0: #0a0e0a
- matrixInk1: #0e130d
- matrixInk2: #141c12
- matrixInk3: #1e2a1b
- rainGreen: #2eff6a
- rainGreenDim: #1cc24b
- rainGreenHi: #62ff94
- rainCyan: #00efff
- rainTeal: #24f6d9
- rainPurple: #c770ff
- rainOrange: #ffa83d
- alertRed: #ff4b4b
- alertYellow: #e6ff57
- alertBlue: #30b3ff
- rainGray: #8ca391
- lightBg: #eef3ea
- lightPaper: #e4ebe1
- lightInk1: #dae1d7
- lightText: #203022
- lightGray: #748476

**Theme Mappings:**

- primary: rainGreen (dark), rainGreenDim (light)
- secondary: rainCyan (dark), rainTeal (light)
- accent: rainPurple (dark), rainPurple (light)
- error: alertRed (dark), alertRed (light)
- warning: alertYellow (dark), alertYellow (light)
- success: rainGreenHi (dark), rainGreenDim (light)
- info: alertBlue (dark), alertBlue (light)
- text: rainGreenHi (dark), lightText (light)
- textMuted: rainGray (dark), lightGray (light)
- background: matrixInk0 (dark), lightBg (light)
- backgroundPanel: matrixInk1 (dark), lightPaper (light)
- backgroundElement: matrixInk2 (dark), lightInk1 (light)
- border: matrixInk3 (dark), lightGray (light)
- borderActive: rainGreen (dark), rainGreenDim (light)
- borderSubtle: matrixInk2 (dark), lightInk1 (light)
- diffAdded: rainGreenDim (dark), rainGreenDim (light)
- diffRemoved: alertRed (dark), alertRed (light)
- diffContext: rainGray (dark), lightGray (light)
- diffHunkHeader: alertBlue (dark), alertBlue (light)
- diffHighlightAdded: #77ffaf (dark), #5dac7e (light)
- diffHighlightRemoved: #ff7171 (dark), #d53a3a (light)
- diffAddedBg: #132616 (dark), #e0efde (light)
- diffRemovedBg: #261212 (dark), #f9e5e5 (light)
- diffContextBg: matrixInk1 (dark), lightPaper (light)
- diffLineNumber: matrixInk3 (dark), lightGray (light)
- diffAddedLineNumberBg: #0f1b11 (dark), #d6e7d2 (light)
- diffRemovedLineNumberBg: #1b1414 (dark), #f2d2d2 (light)
- markdownText: rainGreenHi (dark), lightText (light)
- markdownHeading: rainCyan (dark), rainTeal (light)
- markdownLink: alertBlue (dark), alertBlue (light)
- markdownLinkText: rainTeal (dark), rainTeal (light)
- markdownCode: rainGreenDim (dark), rainGreenDim (light)
- markdownBlockQuote: rainGray (dark), lightGray (light)
- markdownEmph: rainOrange (dark), rainOrange (light)
- markdownStrong: alertYellow (dark), alertYellow (light)
- markdownHorizontalRule: rainGray (dark), lightGray (light)
- markdownListItem: alertBlue (dark), alertBlue (light)
- markdownListEnumeration: rainTeal (dark), rainTeal (light)
- markdownImage: alertBlue (dark), alertBlue (light)
- markdownImageText: rainTeal (dark), rainTeal (light)
- markdownCodeBlock: rainGreenHi (dark), lightText (light)
- syntaxComment: rainGray (dark), lightGray (light)
- syntaxKeyword: rainPurple (dark), rainPurple (light)
- syntaxFunction: alertBlue (dark), alertBlue (light)
- syntaxVariable: rainGreenHi (dark), lightText (light)
- syntaxString: rainGreenDim (dark), rainGreenDim (light)
- syntaxNumber: rainOrange (dark), rainOrange (light)
- syntaxType: alertYellow (dark), alertYellow (light)
- syntaxOperator: rainTeal (dark), rainTeal (light)
- syntaxPunctuation: rainGreenHi (dark), lightText (light)

### Material Theme

**Defs:**

- darkBg: #263238
- darkBgAlt: #1e272c
- darkBgPanel: #37474f
- darkFg: #eeffff
- darkFgMuted: #546e7a
- darkRed: #f07178
- darkPink: #f78c6c
- darkOrange: #ffcb6b
- darkYellow: #ffcb6b
- darkGreen: #c3e88d
- darkCyan: #89ddff
- darkBlue: #82aaff
- darkPurple: #c792ea
- darkViolet: #bb80b3
- lightBg: #fafafa
- lightBgAlt: #f5f5f5
- lightBgPanel: #e7e7e8
- lightFg: #263238
- lightFgMuted: #90a4ae
- lightRed: #e53935
- lightPink: #ec407a
- lightOrange: #f4511e
- lightYellow: #ffb300
- lightGreen: #91b859
- lightCyan: #39adb5
- lightBlue: #6182b8
- lightPurple: #7c4dff
- lightViolet: #945eb8

**Theme Mappings:**

- primary: darkBlue (dark), lightBlue (light)
- secondary: darkPurple (dark), lightPurple (light)
- accent: darkCyan (dark), lightCyan (light)
- error: darkRed (dark), lightRed (light)
- warning: darkYellow (dark), lightYellow (light)
- success: darkGreen (dark), lightGreen (light)
- info: darkOrange (dark), lightOrange (light)
- text: darkFg (dark), lightFg (light)
- textMuted: darkFgMuted (dark), lightFgMuted (light)
- background: darkBg (dark), lightBg (light)
- backgroundPanel: darkBgAlt (dark), lightBgAlt (light)
- backgroundElement: darkBgPanel (dark), lightBgPanel (light)
- border: #37474f (dark), #e0e0e0 (light)
- borderActive: darkBlue (dark), lightBlue (light)
- borderSubtle: #1e272c (dark), #eeeeee (light)
- diffAdded: darkGreen (dark), lightGreen (light)
- diffRemoved: darkRed (dark), lightRed (light)
- diffContext: darkFgMuted (dark), lightFgMuted (light)
- diffHunkHeader: darkCyan (dark), lightCyan (light)
- diffHighlightAdded: darkGreen (dark), lightGreen (light)
- diffHighlightRemoved: darkRed (dark), lightRed (light)
- diffAddedBg: #2e3c2b (dark), #e8f5e9 (light)
- diffRemovedBg: #3c2b2b (dark), #ffebee (light)
- diffContextBg: darkBgAlt (dark), lightBgAlt (light)
- diffLineNumber: #37474f (dark), #cfd8dc (light)
- diffAddedLineNumberBg: #2e3c2b (dark), #e8f5e9 (light)
- diffRemovedLineNumberBg: #3c2b2b (dark), #ffebee (light)
- markdownText: darkFg (dark), lightFg (light)
- markdownHeading: darkBlue (dark), lightBlue (light)
- markdownLink: darkCyan (dark), lightCyan (light)
- markdownLinkText: darkPurple (dark), lightPurple (light)
- markdownCode: darkGreen (dark), lightGreen (light)
- markdownBlockQuote: darkFgMuted (dark), lightFgMuted (light)
- markdownEmph: darkYellow (dark), lightYellow (light)
- markdownStrong: darkOrange (dark), lightOrange (light)
- markdownHorizontalRule: #37474f (dark), #e0e0e0 (light)
- markdownListItem: darkBlue (dark), lightBlue (light)
- markdownListEnumeration: darkCyan (dark), lightCyan (light)
- markdownImage: darkCyan (dark), lightCyan (light)
- markdownImageText: darkPurple (dark), lightPurple (light)
- markdownCodeBlock: darkFg (dark), lightFg (light)
- syntaxComment: darkFgMuted (dark), lightFgMuted (light)
- syntaxKeyword: darkPurple (dark), lightPurple (light)
- syntaxFunction: darkBlue (dark), lightBlue (light)
- syntaxVariable: darkFg (dark), lightFg (light)
- syntaxString: darkGreen (dark), lightGreen (light)
- syntaxNumber: darkOrange (dark), lightOrange (light)
- syntaxType: darkYellow (dark), lightYellow (light)
- syntaxOperator: darkCyan (dark), lightCyan (light)
- syntaxPunctuation: darkFg (dark), lightFg (light)

### Mellow Theme

**Defs:**

- dark_bg: #161617
- dark_fg: #c9c7cd
- dark_bg_dark: #131314
- dark_black: #27272a
- dark_red: #f5a191
- dark_green: #90b99f
- dark_yellow: #e6b99d
- dark_blue: #aca1cf
- dark_magenta: #e29eca
- dark_cyan: #ea83a5
- dark_white: #c1c0d4
- dark_bright_black: #353539
- dark_bright_red: #ffae9f
- dark_bright_green: #9dc6ac
- dark_bright_yellow: #f0c5a9
- dark_bright_blue: #b9aeda
- dark_bright_magenta: #ecaad6
- dark_bright_cyan: #f591b2
- dark_bright_white: #cac9dd
- dark_gray00: #18181a
- dark_gray01: #1b1b1d
- dark_gray02: #2a2a2d
- dark_gray03: #3e3e43
- dark_gray04: #57575f
- dark_gray05: #757581
- dark_gray06: #9998a8
- dark_gray07: #c1c0d4

**Theme Mappings:**

- primary: dark_cyan
- secondary: dark_cyan
- accent: dark_blue
- error: dark_cyan
- warning: dark_yellow
- success: dark_green
- info: dark_blue
- text: dark_fg
- textMuted: dark_white
- background: dark_bg
- backgroundPanel: dark_gray01
- backgroundElement: dark_gray02
- border: dark_gray02
- borderActive: dark_gray01
- borderSubtle: dark_gray00
- diffAdded: dark_black
- diffRemoved: dark_black
- diffContext: dark_fg
- diffHunkHeader: dark_magenta
- diffHighlightAdded: dark_bright_green
- diffHighlightRemoved: dark_bright_red
- diffAddedBg: dark_green
- diffRemovedBg: dark_red
- diffContextBg: dark_gray00
- diffLineNumber: diffContextBg
- diffAddedLineNumberBg: dark_green
- diffRemovedLineNumberBg: dark_red
- markdownText: dark_fg
- markdownHeading: dark_gray06
- markdownLink: dark_blue
- markdownLinkText: dark_cyan
- markdownCode: dark_bright_green
- markdownBlockQuote: dark_gray00
- markdownEmph: dark_bright_yellow
- markdownStrong: dark_bright_red
- markdownHorizontalRule: markdownText
- markdownListItem: dark_blue
- markdownListEnumeration: dark_bright_blue
- markdownImage: markdownLink
- markdownImageText: markdownLinkText
- markdownCodeBlock: dark_fg
- syntaxComment: dark_gray05
- syntaxKeyword: dark_blue
- syntaxFunction: dark_gray07
- syntaxVariable: dark_fg
- syntaxString: dark_green
- syntaxNumber: dark_magenta
- syntaxType: dark_magenta
- syntaxOperator: dark_yellow
- syntaxPunctuation: dark_gray06

### Monokai Theme

**Defs:**

- background: #272822
- backgroundAlt: #1e1f1c
- backgroundPanel: #3e3d32
- foreground: #f8f8f2
- comment: #75715e
- red: #f92672
- orange: #fd971f
- lightOrange: #e69f66
- yellow: #e6db74
- green: #a6e22e
- cyan: #66d9ef
- blue: #66d9ef
- purple: #ae81ff
- pink: #f92672

**Theme Mappings:**

- primary: cyan (dark), blue (light)
- secondary: purple (dark), purple (light)
- accent: green (dark), green (light)
- error: red (dark), red (light)
- warning: yellow (dark), orange (light)
- success: green (dark), green (light)
- info: orange (dark), orange (light)
- text: foreground (dark), #272822 (light)
- textMuted: comment (dark), #75715e (light)
- background: #272822 (dark), #fafafa (light)
- backgroundPanel: #1e1f1c (dark), #f0f0f0 (light)
- backgroundElement: #3e3d32 (dark), #e0e0e0 (light)
- border: #3e3d32 (dark), #d0d0d0 (light)
- borderActive: cyan (dark), blue (light)
- borderSubtle: #1e1f1c (dark), #e8e8e8 (light)
- diffAdded: green (dark), green (light)
- diffRemoved: red (dark), red (light)
- diffContext: comment (dark), #75715e (light)
- diffHunkHeader: comment (dark), #75715e (light)
- diffHighlightAdded: green (dark), green (light)
- diffHighlightRemoved: red (dark), red (light)
- diffAddedBg: #1a3a1a (dark), #e0ffe0 (light)
- diffRemovedBg: #3a1a1a (dark), #ffe0e0 (light)
- diffContextBg: #1e1f1c (dark), #f0f0f0 (light)
- diffLineNumber: #3e3d32 (dark), #d0d0d0 (light)
- diffAddedLineNumberBg: #1a3a1a (dark), #e0ffe0 (light)
- diffRemovedLineNumberBg: #3a1a1a (dark), #ffe0e0 (light)
- markdownText: foreground (dark), #272822 (light)
- markdownHeading: pink (dark), pink (light)
- markdownLink: cyan (dark), blue (light)
- markdownLinkText: purple (dark), purple (light)
- markdownCode: green (dark), green (light)
- markdownBlockQuote: comment (dark), #75715e (light)
- markdownEmph: yellow (dark), orange (light)
- markdownStrong: orange (dark), orange (light)
- markdownHorizontalRule: comment (dark), #75715e (light)
- markdownListItem: cyan (dark), blue (light)
- markdownListEnumeration: purple (dark), purple (light)
- markdownImage: cyan (dark), blue (light)
- markdownImageText: purple (dark), purple (light)
- markdownCodeBlock: foreground (dark), #272822 (light)
- syntaxComment: comment (dark), #75715e (light)
- syntaxKeyword: pink (dark), pink (light)
- syntaxFunction: green (dark), green (light)
- syntaxVariable: foreground (dark), #272822 (light)
- syntaxString: yellow (dark), orange (light)
- syntaxNumber: purple (dark), purple (light)
- syntaxType: cyan (dark), blue (light)
- syntaxOperator: pink (dark), pink (light)
- syntaxPunctuation: foreground (dark), #272822 (light)

---

## Describe Theme Structure

Explain how themes are structured with defs and theme.

### Defs Section

Defines color variables used throughout the theme.

- Contains named color values like "bg", "fg", "red", etc.
- Can reference other defs or use hex colors.
- Provides base palette for the theme.

### Theme Section

Maps semantic roles to colors from defs.

- Each key represents a UI element or semantic meaning.
- Values are objects with "dark" and "light" variants.
- References defs by name or uses direct color values.
- Defines how colors are applied to different parts of the interface.

---

## Outline Usage Patterns

Show how themes can be customized and extended.

### Customization

- Modify existing defs to change colors.
- Override theme mappings for specific elements.
- Add new defs for additional colors.

### Extension

- Create new theme files following the JSON schema.
- Define custom semantic roles in theme section.
- Use theme inheritance by referencing other themes.

### Integration

- Load theme JSON files into the application.
- Apply CSS variables based on theme mappings.
- Support dynamic theme switching.

### Best Practices

- Use consistent naming conventions for defs.
- Provide both dark and light variants.
- Test themes across different UI components.

---

## Commit Changes

Save the comprehensive design document.

<xai:function_call name="bash">
<parameter name="command">git add design-document.md && git commit -m "docs: regenerate design document with corrections"
