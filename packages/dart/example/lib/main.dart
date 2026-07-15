import 'package:flutter/material.dart';
import 'package:iconkit/iconkit.dart';

void main() => runApp(const IconKitExampleApp());

class IconKitExampleApp extends StatelessWidget {
  const IconKitExampleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'IconKit example',
      theme: ThemeData(colorSchemeSeed: Colors.teal, useMaterial3: true),
      home: Scaffold(
        appBar: AppBar(title: const Text('IconKit')),
        body: const Center(
          child: Wrap(
            spacing: 24,
            runSpacing: 24,
            children: [
              IconKitIcon(IconKit.home, size: 40),
              IconKitIcon(IconKit.heart, size: 40, mode: IconKitMode.solid, color: Colors.red),
              IconKitIcon(IconKit.star, size: 40, mode: IconKitMode.solid, color: Colors.amber),
              IconKitIcon(IconKit.camera, size: 40, color: Colors.teal),
              IconKitIcon(IconKit.bell, size: 40, color: Colors.indigo),
              IconKitIcon(IconKit.search, size: 40),
            ],
          ),
        ),
      ),
    );
  }
}
